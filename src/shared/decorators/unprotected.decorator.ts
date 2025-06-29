import { SetMetadata } from "@nestjs/common";

export const UNPROTECTED_KEY = "unprotected";

export const Unprotected = () => SetMetadata(UNPROTECTED_KEY, true);
