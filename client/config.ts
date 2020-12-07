import { fromEither } from "fp-ts/lib/Option";
import { ClientConfigIO } from "../lib/io";


export const getConfig = () => {
    const logserver = (<any>window).mapLogServer;
    return fromEither(ClientConfigIO.decode(logserver))
}