import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
} from "class-validator";

import { isAttribute } from "@shared/types/attributes";

export function IsValidAttribute(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: "isValidAttribute",
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (Array.isArray(value)) {
						return value.every(v => isAttribute(v));
					}

					return isAttribute(value);
				},
				defaultMessage(args: ValidationArguments) {
					return `${args.property} must contain only valid attributes`;
				},
			},
		});
	};
}
