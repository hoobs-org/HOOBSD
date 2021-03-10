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

import Request from "axios";
import State from "../state";

export default class Releases {
    static fetch(application: string, beta?: boolean): { [key: string]: any } {
        const key = `release/${application}`;
        const cached = State.cache?.get<{ [key: string]: any }>(key);

        if (cached) return cached;

        let results: { [key: string]: any } | undefined;

        (async () => {
            results = (await Request.get(`https://support.hoobs.org/api/releases/${application}/${beta ? "beta" : "latest"}`)).data.results;
        })();

        if (results) State.cache?.set(key, results, 4 * 60);

        return results || {};
    }
}
