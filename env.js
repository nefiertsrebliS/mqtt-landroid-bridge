"use strict";

function updateConfigWithEnvVars(config, prefix = '', structure = config, env = process.env) {
    if (typeof structure === 'string') {
        return env[prefix.toUpperCase()] ?? config;
    } else if (Array.isArray(structure)) {
        let index = 0;
        // Use the first item of the array to get the conig structure
        let itemStructure = structure[index];
        const result = [];
        while (true) {
            let item = config?.[index];
            itemStructure = structure[index] ?? itemStructure;
            const arrayEnvVarPrefix = `${prefix}_${index}`;
            const nextItem = updateConfigWithEnvVars(item, arrayEnvVarPrefix, itemStructure, env);
            if (nextItem != null) {
                result.push(nextItem);
                index++;
            } else {
                break;
            }
        }
        return result;
    } else if (typeof structure === 'object') {
        const result = { ...config };
        Object.keys(structure).forEach((key) => {
            const path = prefix ? `${prefix}_${key}` : key;
            const value = updateConfigWithEnvVars(config?.[key], path, structure[key], env);
            if (value != null) {
                result[key] = value;
            }
        });
        return Object.keys(result).length === 0 ? undefined : result;
    }
    return config;
  }
  module.exports = updateConfigWithEnvVars;