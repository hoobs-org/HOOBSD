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

import Os from "os";
import Unzip from "unzipper";
import Archiver from "archiver";

import {
    existsSync,
    writeFileSync,
    unlinkSync,
    ensureDirSync,
    removeSync,
    readdirSync,
    lstatSync,
    createReadStream,
    createWriteStream,
    renameSync,
    copySync,
} from "fs-extra";

import { execSync } from "child_process";
import { join, basename } from "path";
import State from "../state";
import Paths from "./paths";
import Config from "./config";
import System from "./system";
import { Console, NotificationType } from "./logger";

import {
    loadJson,
    formatJson,
    sanitize,
} from "./formatters";

const BRIDGE_TEARDOWN_DELAY = 2000;

export interface BridgeRecord {
    id: string;
    type: string;
    display: string;
    port: number;
    pin?: string;
    username?: string;
    ports?: { [key: string]: number };
    autostart?: number;
    host?: string;
    plugins?: string;
    advertiser?: string;
}

export default class Bridges {
    static locate() {
        const paths = (process.env.PATH || "").split(":");

        for (let i = 0; i < paths.length; i += 1) {
            if (existsSync(join(paths[i], "hoobsd"))) return paths[i];
        }

        return "";
    }

    static network(): string[] {
        const ifaces: NodeJS.Dict<Os.NetworkInterfaceInfo[]> = Os.networkInterfaces();
        const results: string[] = [];

        Object.keys(ifaces).forEach((ifname: string) => {
            ifaces[ifname]!.forEach((iface: Os.NetworkInterfaceInfo) => {
                if (iface.family !== "IPv4" || iface.internal !== false) return;
                if (results.indexOf(iface.address) === -1) results.push(`${iface.address}`);
            });
        });

        return results;
    }

    static extentions(): { [key: string]: string | boolean }[] {
        return [{
            feature: "gui",
            description: "enables the gui",
            enabled: existsSync("/usr/lib/hoobs/package.json"),
        }, {
            feature: "ffmpeg",
            description: "enables ffmpeg camera support",
            enabled: Paths.tryCommand("ffmpeg"),
        }];
    }

    static list(): BridgeRecord[] {
        const host = Bridges.network()[0];

        let bridges: BridgeRecord[] = [];

        if (existsSync(Paths.bridges)) bridges = loadJson<BridgeRecord[]>(Paths.bridges, []);

        for (let i = 0; i < bridges.length; i += 1) {
            bridges[i].host = host;

            if (existsSync(join(Paths.data(bridges[i].id), "package.json"))) bridges[i].plugins = join(Paths.data(bridges[i].id), "node_modules");
        }

        return bridges;
    }

    static manage(action: string) {
        return new Promise((resolve) => {
            if (existsSync("/etc/systemd/system/hoobsd.service")) {
                switch (action) {
                    case "start":
                        try {
                            execSync("systemctl start hoobsd.service");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    case "stop":
                        try {
                            execSync("systemctl stop hoobsd.service");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    case "restart":
                        try {
                            execSync("systemctl restart hoobsd.service");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    default:
                        break;
                }
            }

            if (existsSync("/Library/LaunchDaemons/org.hoobsd.plist")) {
                switch (action) {
                    case "start":
                        try {
                            execSync("launchctl load -w /Library/LaunchDaemons/org.hoobsd.plist");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    case "stop":
                        try {
                            execSync("launchctl unload /Library/LaunchDaemons/org.hoobsd.plist");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    case "restart":
                        try {
                            execSync("launchctl unload /Library/LaunchDaemons/org.hoobsd.plist && launchctl load -w /Library/LaunchDaemons/org.hoobsd.plist");

                            return resolve(true);
                        } catch (_error) {
                            return resolve(false);
                        }

                    default:
                        break;
                }
            }

            return resolve(false);
        });
    }

    static update(name: string): { [key: string]: any } {
        return {
            info: (display: string, pin?: string, username?: string, autostart?: number, advertiser?: string): Promise<boolean> => new Promise((resolve) => {
                if (!name) return resolve(false);

                const id = sanitize(name);
                const index = State.bridges.findIndex((n) => n.id === id);

                if (index >= 0) {
                    State.bridges[index].display = display;
                    State.bridges[index].pin = pin || State.bridges[index].pin || "031-45-154";
                    State.bridges[index].username = username || State.bridges[index].username || Config.generateUsername();
                    State.bridges[index].autostart = autostart || 0;
                    State.bridges[index].advertiser = advertiser || State.bridges[index].advertiser || "bonjour";

                    writeFileSync(Paths.bridges, formatJson(State.bridges));

                    return resolve(true);
                }

                return resolve(false);
            }),

            ports: (start: number, end: number): Promise<boolean> => new Promise((resolve) => {
                if (!name) return resolve(false);

                const id = sanitize(name);
                const index = State.bridges.findIndex((n) => n.id === id);

                if (index >= 0) {
                    State.bridges[index].ports = {
                        start,
                        end,
                    };

                    writeFileSync(Paths.bridges, formatJson(State.bridges));

                    return resolve(true);
                }

                return resolve(false);
            }),
        };
    }

    static uninstall(name: string): boolean {
        if (!name) return false;

        const id = sanitize(name);
        const index = State.bridges.findIndex((n: BridgeRecord) => n.id === id);

        if (index >= 0) {
            State.bridges.splice(index, 1);

            writeFileSync(Paths.bridges, formatJson(State.bridges));

            removeSync(join(Paths.data(), id));
            removeSync(join(Paths.data(), `${id}.accessories`));
            removeSync(join(Paths.data(), `${id}.persist`));
            removeSync(join(Paths.data(), `${id}.conf`));

            Console.notify(
                "hub",
                "Bridge Removed",
                `Bridge "${name}" removed.`,
                NotificationType.WARN,
                "layers",
            );

            return true;
        }

        return false;
    }

    static append(id: string, display: string, type: string, port: number, pin: string, username: string, autostart: number, advertiser: string) {
        const bridges: BridgeRecord[] = [];

        for (let i = 0; i < State.bridges.length; i += 1) {
            const { ...bridge } = State.bridges[i];

            if (bridge.id === "hub") {
                bridges.unshift({
                    id: bridge.id,
                    type: bridge.type,
                    display: bridge.display,
                    port: bridge.port,
                    pin: bridge.pin,
                    username: bridge.username,
                    autostart: 0,
                    advertiser: undefined,
                });
            } else {
                bridges.push({
                    id: bridge.id,
                    type: bridge.type,
                    display: bridge.display,
                    port: bridge.port,
                    pin: bridge.pin,
                    username: bridge.username,
                    ports: bridge.ports,
                    autostart: bridge.autostart,
                    advertiser: bridge.advertiser,
                });
            }
        }

        if (id === "hub") {
            bridges.unshift({
                id,
                type,
                display,
                port,
                pin,
                username,
                autostart: 0,
                advertiser: undefined,
            });
        } else {
            bridges.push({
                id,
                type,
                display,
                port,
                pin,
                username,
                autostart: autostart || 0,
                advertiser,
            });
        }

        writeFileSync(Paths.bridges, formatJson(bridges));
    }

    static create(name: string, port: number, pin: string, username: string, advertiser: string): void {
        if (!existsSync(Paths.bridges)) writeFileSync(Paths.bridges, "[]");

        Bridges.append(sanitize(name), name, sanitize(name) === "hub" ? "hub" : "bridge", port, pin, username, 0, advertiser);

        Console.notify(
            "hub",
            "Bridge Added",
            `Bridge "${name}" added.`,
            NotificationType.SUCCESS,
            "layers",
        );
    }

    static accessories(bridge: string): { [key: string]: any }[] {
        return loadJson<{ [key: string]: any }[]>(join(Paths.data(), `${bridge}.accessories`, "cachedAccessories"), []);
    }

    static parings(bridge: string): { [key: string]: any }[] {
        const pairings = readdirSync(join(Paths.data(), `${bridge}.persist`)).filter((d) => d.match(/AccessoryInfo\.([A-F,a-f,0-9]+)\.json/));
        const results = [];

        for (let i = 0; i < pairings.length; i += 1) {
            const pairing = loadJson<{ [key: string]: any }>(join(Paths.data(), `${bridge}.persist`, pairings[i]), {});
            const [, id] = pairings[i].split(".");

            results.push({
                id,
                version: pairing.configVersion,
                username: ((id || "").match(/.{1,2}/g) || []).join(":"),
                display: pairing.displayName,
                category: pairing.category,
                setup_pin: pairing.pincode,
                setup_id: pairing.setupID,
                clients: pairing.pairedClients,
                permissions: pairing.pairedClientsPermission,
            });
        }

        return results;
    }

    static purge(bridge: string, uuid?: string): void {
        if (uuid) {
            const working = loadJson<{ [key: string]: any }[]>(join(Paths.data(), `${bridge}.accessories`, "cachedAccessories"), []);
            let index = working.findIndex((item: { [key: string]: any }) => item.UUID === uuid);

            while (index >= 0) {
                working.splice(index, 1);
                index = working.findIndex((item: { [key: string]: any }) => item.UUID === uuid);
            }

            writeFileSync(join(Paths.data(), `${bridge}.accessories`, "cachedAccessories"), formatJson(working));
        } else {
            if (existsSync(join(Paths.data(), `${bridge}.persist`))) removeSync(join(Paths.data(), `${bridge}.persist`));

            ensureDirSync(join(Paths.data(), `${bridge}.persist`));

            if (existsSync(join(Paths.data(), `${bridge}.accessories`))) removeSync(join(Paths.data(), `${bridge}.accessories`));

            ensureDirSync(join(Paths.data(), `${bridge}.accessories`));

            Console.notify(
                bridge,
                "Caches Purged",
                "Accessory and connection cache purged.",
                NotificationType.SUCCESS,
                "memory",
            );
        }
    }

    static async reset(): Promise<void> {
        State.restoring = true;

        await State.hub?.stop();
        await Bridges.backup();

        const bridges = Bridges.list().filter((item) => item.type === "bridge");

        for (let i = 0; i < bridges.length; i += 1) Bridges.uninstall(bridges[i].id);

        removeSync(join(Paths.data(), "hub"));
        removeSync(join(Paths.data(), "hub.accessories"));
        removeSync(join(Paths.data(), "hub.persist"));
        removeSync(join(Paths.data(), "hub.conf"));
        removeSync(join(Paths.data(), "hoobs.log"));
        removeSync(join(Paths.data(), "layout.conf"));
        removeSync(join(Paths.data(), "access"));

        State.users = [];
    }

    static export(id: string): Promise<string> {
        return new Promise((resolve, reject) => {
            id = sanitize(id);

            const bridge = State.bridges.find((item) => item.id === id);

            writeFileSync(join(Paths.data(), "meta"), formatJson({
                date: (new Date()).getTime(),
                type: "bridge",
                data: {
                    name: bridge?.id,
                    type: bridge?.type,
                    ports: bridge?.ports,
                    autostart: bridge?.autostart,
                    advertiser: bridge?.advertiser,
                },
                product: "hoobs",
                generator: "hoobsd",
                version: State.version,
            }));

            if (!bridge) reject(new Error("bridge does not exist"));

            const filename = `${id}_${new Date().getTime()}`;
            const output = createWriteStream(join(Paths.backups, `${filename}.zip`));
            const archive = Archiver("zip");

            output.on("close", () => {
                renameSync(join(Paths.backups, `${filename}.zip`), join(Paths.backups, `${filename}.bridge`));
                unlinkSync(join(Paths.data(), "meta"));

                resolve(`${filename}.bridge`);
            });

            archive.on("error", (error) => {
                reject(error);
            });

            archive.pipe(output);

            archive.file(join(Paths.data(), "meta"), { name: "meta" });
            archive.file(join(Paths.data(), `${bridge?.id}.conf`), { name: `${bridge?.id}.conf` });

            Bridges.dig(archive, join(Paths.data(), `${bridge?.id}`));

            archive.finalize();
        });
    }

    static backup(): Promise<string> {
        return new Promise((resolve, reject) => {
            writeFileSync(join(Paths.data(), "meta"), formatJson({
                date: (new Date()).getTime(),
                type: "full",
                product: "hoobs",
                generator: "hoobsd",
                version: State.version,
            }));

            const filename = `${new Date().getTime()}`;
            const entries = readdirSync(Paths.data());
            const output = createWriteStream(join(Paths.backups, `${filename}.zip`));
            const archive = Archiver("zip");

            output.on("close", () => {
                renameSync(join(Paths.backups, `${filename}.zip`), join(Paths.backups, `${filename}.backup`));
                unlinkSync(join(Paths.data(), "meta"));

                resolve(`${filename}.backup`);
            });

            archive.on("error", (error) => {
                reject(error);
            });

            archive.pipe(output);

            for (let i = 0; i < entries.length; i += 1) {
                const path = join(Paths.data(), entries[i]);

                if (path !== Paths.backups) {
                    if (lstatSync(path).isDirectory()) {
                        Bridges.dig(archive, path);
                    } else {
                        archive.file(path, { name: entries[i] });
                    }
                }
            }

            archive.finalize();
        });
    }

    static dig(archive: Archiver.Archiver, directory: string): void {
        const entries = readdirSync(directory);

        for (let i = 0; i < entries.length; i += 1) {
            const path = join(directory, entries[i]);

            if (basename(path) !== "node_modules" && basename(path) !== "cache" && basename(path) !== "config.json") {
                if (lstatSync(path).isDirectory()) {
                    archive.directory(path, join(basename(directory), entries[i]));
                } else {
                    archive.file(path, { name: join(basename(directory), entries[i]) });
                }
            }
        }
    }

    static metadata(file: string): Promise<{ [key: string]: any }> {
        return new Promise((resolve) => {
            let results: { [key: string]: any } = {};

            createReadStream(file).pipe(Unzip.Parse()).on("entry", (entry) => {
                const filename = entry.path;
                const { type } = entry;

                if (type === "File" && filename === "meta") {
                    entry.buffer().then((content: any) => {
                        try {
                            results = JSON.parse(content);
                        } catch (_error) {
                            results = {};
                        }
                    });
                } else {
                    entry.autodrain();
                }
            }).on("finish", () => {
                Console.info(`restore type "${results.type}"`);

                resolve(results);
            });
        });
    }

    static import(name: string, port: number, pin: string, username: string, advertiser: string, file: string, remove?: boolean): Promise<void> {
        return new Promise((resolve) => {
            Console.warn("performing bridge import");

            Bridges.metadata(file).then((metadata) => {
                if (metadata.type === "bridge") {
                    const id = sanitize(name);
                    const filename = join(Paths.data(), `import-${new Date().getTime()}.zip`);

                    if (remove) {
                        renameSync(file, filename);
                    } else {
                        copySync(file, filename);
                    }

                    ensureDirSync(join(Paths.backups, "stage"));

                    createReadStream(filename).pipe(Unzip.Extract({
                        path: join(Paths.backups, "stage"),
                    })).on("finish", () => {
                        unlinkSync(filename);

                        setTimeout(async () => {
                            copySync(join(Paths.backups, "stage", `${metadata.data.name}.conf`), join(Paths.data(), `${id}.conf`));
                            copySync(join(Paths.backups, "stage", metadata.data.name), join(Paths.data(), id));

                            Bridges.create(name, port, pin, username, advertiser);

                            const bridges = Bridges.list();
                            const index = bridges.findIndex((n) => n.id === id);

                            if (index >= 0) {
                                if (metadata.data.autostart !== undefined) bridges[index].autostart = metadata.data.autostart;
                                if (metadata.data.ports !== undefined) bridges[index].ports = metadata.data.ports;
                                if (metadata.data.autostart !== undefined || metadata.data.ports !== undefined) writeFileSync(Paths.bridges, formatJson(bridges));

                                const stdio = await System.execPersist(`${Paths.yarn} install --unsafe-perm --ignore-engines`, { cwd: Paths.data(id) }, 3);

                                for (let i = 0; i < stdio.length; i += 1) {
                                    if (!stdio[i].toLowerCase().startsWith("done in") && !stdio[i].toLowerCase().startsWith("yarn install")) {
                                        Console.info(stdio[i]);
                                    } else if (stdio[i].toLowerCase().startsWith("yarn install")) {
                                        Console.info("installing plugins");
                                    }
                                }
                            }

                            removeSync(join(Paths.backups, "stage"));
                            resolve();
                        }, BRIDGE_TEARDOWN_DELAY);
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    static restore(file: string, remove?: boolean): Promise<void> {
        return new Promise((resolve) => {
            Console.warn("performing restore");

            Bridges.metadata(file).then((metadata) => {
                if (metadata.type === "full") {
                    State.restoring = true;

                    const filename = join(Paths.data(), `restore-${new Date().getTime()}.zip`);
                    const entries = readdirSync(Paths.data());

                    for (let i = 0; i < entries.length; i += 1) {
                        const path = join(Paths.data(), entries[i]);

                        if (path !== Paths.backups) {
                            if (lstatSync(path).isDirectory()) {
                                removeSync(path);
                            } else {
                                unlinkSync(path);
                            }
                        }
                    }

                    if (remove) {
                        renameSync(file, filename);
                    } else {
                        copySync(file, filename);
                    }

                    createReadStream(filename).pipe(Unzip.Extract({ path: Paths.data() })).on("finish", () => {
                        if (existsSync(filename)) unlinkSync(filename);
                        if (existsSync(join(Paths.data(), "meta"))) unlinkSync(join(Paths.data(), "meta"));

                        setTimeout(async () => {
                            const bridges = loadJson<BridgeRecord[]>(Paths.bridges, []);

                            for (let i = 0; i < bridges.length; i += 1) {
                                const stdio = await System.execPersist(`${Paths.yarn} install --unsafe-perm --ignore-engines`, { cwd: Paths.data(bridges[i].id) }, 3);

                                for (let j = 0; j < stdio.length; j += 1) {
                                    if (!stdio[j].toLowerCase().startsWith("done in") && !stdio[j].toLowerCase().startsWith("yarn install")) {
                                        Console.info(stdio[j]);
                                    } else if (stdio[j].toLowerCase().startsWith("yarn install")) {
                                        Console.info("restoring bridge");
                                    }
                                }
                            }

                            State.restoring = false;

                            Console.info("restore complete");

                            resolve();
                        }, BRIDGE_TEARDOWN_DELAY);
                    });
                } else {
                    resolve();
                }
            });
        });
    }
}
