export function normalizeTerminalCommand(value) {
    return value.trim();
}

export function validateTerminalCommand(value) {
    if (!value) {
        return "";
    }

    if (value.length > 4096) {
        return "Command must be 4096 characters or fewer.";
    }

    if (/[\r\n]/.test(value)) {
        return "Enter one command on a single line.";
    }

    if (value.includes("\0")) {
        return "Command contains an unsupported character.";
    }

    return "";
}
