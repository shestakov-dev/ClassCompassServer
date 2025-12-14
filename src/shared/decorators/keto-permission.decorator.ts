import { SetMetadata } from "@nestjs/common";

import {
	KetoNamespace,
	NamespaceCheckable,
} from "@resources/ory/keto/definitions";

type IdSources = "body" | "params" | "query";

type KetoIdSource<Body extends Record<string, any> = any> =
	| {
			source: IdSources;
			key: keyof Body;
	  }
	| {
			source: "fixed";
			value: string;
	  };

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
