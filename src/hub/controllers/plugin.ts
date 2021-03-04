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

import { join, resolve } from "path";
import { existsSync } from "fs-extra";
import { Request, Response } from "express-serve-static-core";
import State from "../../state";
import Socket from "../services/socket";
import Plugin from "../services/plugin";
import Security from "../../services/security";

export default class PluginController {
    constructor() {
        State.app?.get("/ui/plugin/:name/*", Plugin, (request, response) => this.ui(request, response));
        State.app?.get("/ui/plugin/:scope/:name/*", Plugin, (request, response) => this.ui(request, response));
        State.app?.get("/api/plugin/:name/:action", Security, Plugin, (request, response) => this.execute(request, response));
        State.app?.get("/api/plugin/:scope/:name/:action", Security, Plugin, (request, response) => this.execute(request, response));
    }

    ui(request: Request, response: Response): void {
        response.sendFile(join(response.locals.directory, "static", request.params[0] ? request.params[0] : "index.html"));
    }

    async execute(request: Request, response: Response): Promise<void> {
        if (existsSync(join(response.locals.directory, response.locals.library, "routes.js"))) {
            response.send(await Socket.fetch(response.locals.bridge, `plugin:${response.locals.identifier}:${request.params.action}`, request.params, request.body));
        }

        response.sendFile(resolve(join(State.hub?.settings.gui_path || existsSync("/usr/lib/hoobs") ? "/usr/lib/hoobs" : join(__dirname, "../../static"), "index.html")));
    }
}
