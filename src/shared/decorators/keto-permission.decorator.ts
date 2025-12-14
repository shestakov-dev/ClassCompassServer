import { SetMetadata } from "@nestjs/common";

import {
	KetoNamespace,
	NamespaceCheckable,
} from "@resources/ory/keto/definitions";

// Infer possible key values based on the source type
type KetoIdSourceBody<Body extends Record<string, any>> = {
	source: "body";
	key: keyof Body & string;
};

type KetoIdSourceParamOrQuery = {
	source: "params" | "query";
	key: string;
};

type KetoIdSourceFixed = {
	source: "fixed";
	value: string;
};

// Allow using different source types for extracting the object ID
type KetoIdSource<Body extends Record<string, any>> =
	| KetoIdSourceBody<Body>
	| KetoIdSourceParamOrQuery
	| KetoIdSourceFixed;

export type KetoPermissionOptions<
	Body extends Record<string, any> = any,
	Namespace extends KetoNamespace = KetoNamespace,
> = {
	namespace: Namespace;
	relation: NamespaceCheckable<Namespace>;
} & KetoIdSource<Body>;

export const KETO_PERMISSION_KEY = "ketoPermission";

export const KetoPermission = <
	B extends Record<string, any> = any,
	N extends KetoNamespace = KetoNamespace,
>(
	options: KetoPermissionOptions<B, N>
) => SetMetadata(KETO_PERMISSION_KEY, options);
