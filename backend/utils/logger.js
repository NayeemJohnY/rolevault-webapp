
export const log = (message, ...args) => {
    const timestamp = new Date().toISOString();
    if (args.length > 0) {
        console.log(`[${timestamp}] ${message}`, ...args);
    } else {
        console.log(`[${timestamp}] ${message}`);
    }
}
