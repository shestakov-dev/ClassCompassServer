import { Prisma } from "@prisma/client";

type Models = Uncapitalize<Prisma.ModelName>;

type Actions = "create" | "read" | "update" | "delete" | "*";

type StandardAttribute = `${Models}:${Actions}`;

// No custom attributes for now
type CustomAttribute = never;

export type Attribute = StandardAttribute | CustomAttribute;

// TODO: Make better attribute validation
const MODELS = new Set(
	Object.keys(Prisma.ModelName).map(model => model.toLowerCase())
);
const ACTIONS = new Set(["create", "read", "update", "delete", "*"]);

export function isAttribute(attribute: unknown): attribute is Attribute {
	if (typeof attribute !== "string") {
		return false;
	}

	const [model, action] = attribute.split(":");

	return MODELS.has(model) && ACTIONS.has(action as Actions);
}

export type AttributeCondition =
	| Attribute
	| { AND: AttributeCondition[] }
	| { OR: AttributeCondition[] };
