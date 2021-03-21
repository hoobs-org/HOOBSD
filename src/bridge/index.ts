/**************************************************************************************************
 * hoobsd                                                                                         *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

import { EventEmitter } from "events";
import { HAPStorage } from "hap-nodejs";
import { existsSync } from "fs-extra";
import { join } from "path";
import State from "../state";
import Paths from "../services/paths";
import Socket from "./services/socket";
import Homebridge from "./server";
import Config from "../services/config";
import Plugin from "../services/plugin";
import Plugins from "../services/plugins";

import {
    Console,
    Prefixed,
    Events,
} from "../services/logger";

import StatusController from "./controllers/status";
import AccessoriesController from "./controllers/accessories";

const BRIDGE_START_DELAY = 0;

export default class Bridge extends EventEmitter {
    declare development: boolean;

    declare time: number;

    declare config: any;

    declare settings: any;

    declare readonly port: number;

    constructor(port: number | undefined, development?: boolean) {
        super();

        HAPStorage.setCustomStoragePath(Paths.persist);

        this.time = 0;
        this.port = port || 51826;
        this.config = Config.configuration();
        this.development = development || false;
        this.settings = (this.config || {}).server || {};

        State.socket = new Socket(State.id);

        new StatusController();
        new AccessoriesController();

        const plugins = Plugins.load(State.id, this.development);

        for (let i = 0; i < plugins.length; i += 1) {
            if (existsSync(join(plugins[i].directory, plugins[i].library, "routes.js"))) {
                const plugin = require(join(plugins[i].directory, plugins[i].library, "routes.js"));

                let initializer;

                if (typeof plugin === "function") {
                    initializer = plugin;
                } else if (plugin && typeof plugin.default === "function") {
                    initializer = plugin.default;
                }

                if (initializer) {
                    try {
                        const api = new Plugin(plugins[i].identifier, plugins[i].name);
                        const logger = Prefixed(plugins[i].identifier, api.display);
                        const config = new Config(plugins[i].name);

                        initializer(logger, config, api);
                    } catch (_error) {
                        Console.error(`Error loading plugin ${plugins[i].identifier}`);
                    }
                }
            }
        }
    }

    restart() {
        Socket.emit(Events.RESTART, State.id);
    }

    start(): void {
        const bridge = State.bridges.find((n: any) => n.id === State.id);

        this.config = Config.configuration();
        State.homebridge = new Homebridge(this.port || undefined, this.development);

        State.homebridge?.on(Events.PUBLISH_SETUP_URI, (uri) => {
            State.setup = uri;

            Console.debug(`Setup URI '${uri}'`);
        });

        State.homebridge?.on(Events.ACCESSORY_CHANGE, (accessory, value) => {
            Console.emit(Events.ACCESSORY_CHANGE, State.id, {
                accessory,
                value,
            });
        });

        if ((bridge?.autostart || 0) >= 0) {
            setTimeout(() => {
                State.homebridge?.start();
            }, (bridge?.autostart || BRIDGE_START_DELAY) * 1000);
        }

        State.socket?.start();
    }

    async stop(): Promise<void> {
        Console.debug("Shutting down");

        if (State.homebridge) await State.homebridge.stop();
        if (State.socket) State.socket.stop();

        Console.debug("Stopped");

        State.homebridge = undefined;
    }
}
