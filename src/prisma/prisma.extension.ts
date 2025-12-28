import { Prisma } from "@prisma/client";
import {
	Operation,
	PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";





type ModelId<TModel, TOperation extends Operation> = Prisma.Args<
	TModel,
	TOperation
>["where"]["id"];

export const ensureExists = Prisma.defineExtension({
	name: "ensureExists",
	model: {
		$allModels: {
			async ensureExists<TModel>(
				this: TModel,
				id: ModelId<TModel, "findUnique">
			): Promise<void> {
				const context = Prisma.getExtensionContext(this);

				// @ts-expect-error - We have no way of knowing which model we are working with
				const result = await context.findUnique({
					where: { id },
					// select only the ID to reduce the amount of data transferred
					// therefore increasing performance (slightly)
					select: { id: true },
				});

				if (result === null) {
					throw new PrismaClientKnownRequestError(
						"An operation failed because it depends on one or more records that were required but not found. Expected a record, found none.",
						{
							code: "P2025",
							clientVersion: Prisma.prismaVersion.client,
							meta: {
								modelName: context.$name,
								cause: "Expected a record, found none.",
							},
						}
					);
				}
			},
			async ensureExistsMany<M>(
				this: M,
				ids: ModelId<M, "findMany">[]
			): Promise<void> {
				const context = Prisma.getExtensionContext(this);

				// Fetch all matching records using `findMany`
				// @ts-expect-error - We have no way of knowing which model we are working with
				const results = await context.findMany({
					where: { id: { in: ids } },
					// select only the ID to reduce the amount of data transferred
					// therefore increasing performance (slightly)
					select: { id: true },
				});

				const missingIds = ids.filter(
					// @ts-expect-error - We have no way of knowing which model we are working with
					id => !results.some(result => result.id === id)
				);

				if (missingIds.length > 0) {
					throw new PrismaClientKnownRequestError(
						"An operation failed because it depends on one or more records that were required but not found. Expected a record, found none.",
						{
							code: "P2025",
							clientVersion: Prisma.prismaVersion.client,
							meta: {
								modelName: context.$name,
								cause: `Expected records with ID(s) [${missingIds.join(
									", "
								)}], found none.`,
							},
						}
					);
				}
			},
		},
	},
});
