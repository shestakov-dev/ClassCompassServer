import { SetMetadata } from "@nestjs/common";

import { Attribute } from "@resources/auth/types/attributes";

export const ATTRIBUTES_KEY = "attributes";

export type AttributeCondition =
	| Attribute
	| { AND: AttributeCondition[] }
	| { OR: AttributeCondition[] };

export const Attributes = (...attributes: AttributeCondition[]) =>
	SetMetadata(ATTRIBUTES_KEY, attributes);
