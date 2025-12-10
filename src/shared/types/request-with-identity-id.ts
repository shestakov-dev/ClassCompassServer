import { Request } from "express";

export interface RequestWithIdentityId extends Request {
	identityId?: string;
}
