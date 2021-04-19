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

export const ExcludeServices = [
    "3E",
    "A2",
    "49FB9D4D-0FEA-4BF1-8FA6-E7B18AB86DCE",
];

export const Services: { [key: string]: string } = {
    "3E": "accessory_information",
    "BB": "air_purifier",
    "8D": "sensor",
    "127": "audio_stream",
    "A1": "bridge_configuration",
    "62": "bridging_state",
    "96": "battery",
    "111": "camera",
    "204": "camera",
    "21A": "camera",
    "110": "camera",
    "97": "sensor",
    "7F": "sensor",
    "80": "sensor",
    "129": "data_stream",
    "81": "door",
    "121": "doorbell",
    "40": "fan",
    "B7": "fan",
    "BA": "filter_maintenance",
    "D7": "faucet",
    "41": "garage_door_opener",
    "BC": "heater_cooler",
    "BD": "humidifier_dehumidifier",
    "82": "sensor",
    "CF": "irrigation",
    "83": "sensor",
    "84": "sensor",
    "43": "light",
    "D9": "input_source",
    "44": "lock",
    "45": "lock",
    "112": "microphone",
    "85": "sensor",
    "86": "sensor",
    "47": "outlet",
    "55": "pairing",
    "A2": "protocol_information",
    "5A": "relay",
    "7E": "security_system",
    "CC": "service_label",
    "133": "siri",
    "B9": "slat",
    "87": "sensor",
    "113": "speaker",
    "88": "switch",
    "89": "switch",
    "49": "switch",
    "125": "target_control",
    "122": "target_control",
    "D8": "television",
    "8A": "sensor",
    "4A": "thermostat",
    "99": "time",
    "56": "data_tunnel",
    "D0": "valve",
    "20A": "router",
    "20F": "router",
    "8B": "window",
    "8C": "window_covering",
};

export const Precedence: { [key: string]: number } = {
    "accessory_information": 1,
    "garage_door_opener": 2,
    "fan": 3,
    "light": 4,
    "lock": 5,
    "camera": 6,
    "thermostat": 7,
    "air_purifier": 8,
    "heater_cooler": 9,
    "humidifier_dehumidifier": 10,
    "security_system": 11,
    "door": 12,
    "window_covering": 13,
    "window": 14,
    "doorbell": 15,
    "microphone": 16,
    "speaker": 17,
    "irrigation": 18,
    "valve": 19,
    "faucet": 20,
    "television": 21,
    "outlet": 22,
    "siri": 23,
    "router": 24,
    "switch": 25,
    "relay": 26,
    "sensor": 27,
    "time": 28,
    "pairing": 29,
    "bridging_state": 30,
    "slat": 31,
    "battery": 32,
    "bridge_configuration": 33,
    "protocol_information": 34,
    "filter_maintenance": 35,
    "service_label": 36,
    "input_source": 37,
    "target_control": 38,
    "audio_stream": 39,
    "data_stream": 40,
    "data_tunnel": 41,
    "smoke_detected": 100,
    "leak_detected": 101,
    "current_temperature": 102,
    "current_relative_humidity": 103,
    "carbon_dioxide_detected": 104,
    "carbon_monoxide_detected": 105,
    "contact_sensor_state": 106,
    "current_door_state": 107,
    "motion_detected": 108,
    "obstruction_detected": 109,
    "occupancy_detected": 110,
};

export const Characteristics: { [key: string]: string } = {
    "A6": "accessory_flags",
    "220": "product_data",
    "B0": "active",
    "1": "administrator_only_access",
    "2": "bridge_id",
    "3": "device_id",
    "4": "plugin_id",
    "64": "air_particulate_density",
    "65": "air_particulate_size",
    "95": "air_quality",
    "5": "audio_feedback",
    "68": "battery_level",
    "8": "brightness",
    "92": "carbon_dioxide_detected",
    "93": "carbon_dioxide_level",
    "94": "carbon_dioxide_peak_level",
    "69": "carbon_monoxide_detected",
    "90": "carbon_monoxide_level",
    "91": "carbon_monoxide_peak_level",
    "8F": "charging_state",
    "CE": "color_temperature",
    "6A": "contact_sensor_state",
    "D": "cooling_threshold_temperature",
    "A9": "current_air_purifier_state",
    "6B": "current_ambient_light_level",
    "E": "current_door_state",
    "AF": "current_fan_state",
    "B1": "current_heater_cooler_state",
    "F": "current_heating_cooling_state",
    "6C": "current_horizontal_tilt_angle",
    "B3": "current_humidifier_dehumidifier_state",
    "6D": "current_position",
    "10": "current_relative_humidity",
    "AA": "current_slat_state",
    "11": "current_temperature",
    "C1": "current_tilt_angle",
    "6E": "current_vertical_tilt_angle",
    "11D": "digital_zoom",
    "AC": "filter_change_indication",
    "AB": "filter_life_level",
    "52": "firmware_revision",
    "53": "hardware_revision",
    "12": "heating_threshold_temperature",
    "6F": "hold_position",
    "13": "hue",
    "14": "identify",
    "11F": "image_mirroring",
    "11E": "image_rotation",
    "D2": "in_use",
    "D6": "is_configured",
    "70": "leak_detected",
    "19": "lock_control_point",
    "1D": "lock_current_state",
    "1C": "lock_last_known_action",
    "1A": "lock_management_auto_security_timeout",
    "A7": "lock_physical_controls",
    "1E": "lock_target_state",
    "1F": "logs",
    "20": "manufacturer",
    "21": "model",
    "22": "motion_detected",
    "11A": "mute",
    "23": "name",
    "11B": "night_vision",
    "C4": "nitrogen_dioxide_density",
    "24": "obstruction_detected",
    "71": "occupancy_detected",
    "25": "on",
    "11C": "optical_zoom",
    "26": "outlet_in_use",
    "C3": "ozone_density",
    "4C": "pair_setup",
    "4E": "pair_verify",
    "4F": "pairing_features",
    "50": "pairing_pairings",
    "C7": "pm_density",
    "C6": "pm_t_density",
    "72": "position_state",
    "D1": "program_mode",
    "73": "programmable_switch_event",
    "C9": "relative_humidity_dehumidifier_threshold",
    "CA": "relative_humidity_humidifier_threshold",
    "D4": "remaining_duration",
    "AD": "reset_filter_indication",
    "28": "rotation_direction",
    "29": "rotation_speed",
    "2F": "saturation",
    "8E": "security_system_alarm_type",
    "66": "security_system_current_state",
    "67": "security_system_target_state",
    "117": "selected_rtp_stream_configuration",
    "30": "serial_number",
    "CB": "service_label_index",
    "CD": "service_label_namespace",
    "D3": "set_duration",
    "118": "setup_endpoints",
    "C0": "slat_type",
    "76": "smoke_detected",
    "75": "status_active",
    "77": "status_fault",
    "78": "status_jammed",
    "79": "status_low_battery",
    "7A": "status_tampered",
    "120": "streaming_status",
    "C5": "sulphur_dioxide_density",
    "115": "supported_audio_stream_configuration",
    "116": "supported_rtp_configuration",
    "114": "supported_video_stream_configuration",
    "B6": "swing_mode",
    "A8": "target_air_purifier_state",
    "AE": "target_air_quality",
    "32": "target_door_state",
    "BF": "target_fan_state",
    "B2": "target_heater_cooler_state",
    "33": "target_heating_cooling_state",
    "7B": "target_horizontal_tilt_angle",
    "B4": "target_humidifier_dehumidifier_state",
    "7C": "target_position",
    "34": "target_relative_humidity",
    "BE": "target_slat_state",
    "35": "target_temperature",
    "C2": "target_tilt_angle",
    "7D": "target_vertical_tilt_angle",
    "36": "temperature_display_units",
    "D5": "valve_type",
    "37": "version",
    "C8": "voc_density",
    "119": "volume",
    "B5": "water_level",
    "226": "recording_audio_active",
    "205": "supported_camera_recording_configuration",
    "206": "supported_video_recording_configuration",
    "207": "supported_audio_recording_configuration",
    "209": "selected_camera_recording_configuration",
    "21D": "camera_operating_mode_indicator",
    "223": "event_snapshots_active",
    "224": "diagonal_field_of_view",
    "21B": "homekit_camera_active",
    "227": "manually_disabled",
    "21C": "third_party_camera_active",
    "225": "periodic_snapshots_active",
    "20C": "network_client_profile_control",
    "20D": "network_client_status_control",
    "20E": "router_status",
    "210": "supported_router_configuration",
    "211": "wan_configuration_list",
    "212": "wan_status_list",
    "215": "managed_network_enable",
    "21F": "network_access_violation_control",
    "21E": "wifi_satellite_status",
    "A4": "app_matching_identifier",
    "74": "programmable_switch_output_state",
    "54": "software_revision",
    "57": "accessory_identifier",
    "A3": "category",
    "A0": "configure_bridged_accessory",
    "9D": "configure_bridged_accessory_status",
    "9B": "current_time",
    "98": "day_of_the_week",
    "9E": "discover_bridged_accessories",
    "9F": "discovered_bridged_accessories",
    "9C": "link_quality",
    "63": "reachable",
    "5E": "relay_control_point",
    "5B": "relay_enabled",
    "5C": "relay_state",
    "9A": "time_update",
    "61": "tunnel_connection_timeout",
    "60": "tunneled_accessory_advertising",
    "59": "tunneled_accessory_connected",
    "58": "tunneled_accessory_state_number",
    "E7": "active_identifier",
    "E3": "configured_name",
    "E8": "sleep_discovery_mode",
    "DD": "closed_captions",
    "136": "display_order",
    "E0": "current_media_state",
    "137": "target_media_state",
    "E2": "picture_mode",
    "DF": "power_mode_selection",
    "E1": "remote_key",
    "DB": "input_source_type",
    "DC": "input_device_type",
    "E6": "identifier",
    "135": "current_visibility_state",
    "134": "target_visibility_state",
    "E9": "volume_control_type",
    "EA": "volume_selector",
    "123": "target_control_supported_configuration",
    "124": "target_control_list",
    "126": "button_event",
    "128": "selected_audio_stream_configuration",
    "132": "siri_input_type",
    "130": "supported_data_stream_transport_configuration",
    "131": "setup_data_stream_transport",
};
