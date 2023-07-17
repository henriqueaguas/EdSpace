import { logger } from "$lib/index.server";

export function PerformanceLoggerHook(target: any) {
    attachNested(target);

    const nestedProperties = Object.getOwnPropertyNames(target);
    nestedProperties.forEach((property) => {
        if (
            typeof target[property] === "object" &&
            target[property] !== null &&
            property[0] !== "_" // ignore private properties
        ) {
            attachNested(target[property]);
        }
    });

    logger.setup("PerformanceLogger hooked to Services")

    function attachNested(inTarget: any) {
        const originalMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(inTarget));

        originalMethods
            .filter((name) => name !== 'constructor')
            .filter((name) => name[0] !== '_')
            .filter((name) => typeof inTarget[name] === 'function')
            .forEach((functionName) => {
                const originalFunction = inTarget[functionName];
                inTarget[functionName] = async function (...args: any[]) {
                    const start = performance.now();
                    const result = await originalFunction.apply(this, args);
                    const msTaken = (performance.now() - start).toFixed(2);
                    logger.performance(`${Object.getPrototypeOf(inTarget).constructor.name}.${functionName}: ${msTaken}ms`);
                    return result;
                };
            });
    }
}
