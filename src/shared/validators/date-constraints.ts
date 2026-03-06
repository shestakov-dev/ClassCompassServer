import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from "class-validator";

/**
 * Validates that a property is strictly after another property
 * on the same object.
 * Works with both Date objects and comparable primitives (strings, numbers).
 */
@ValidatorConstraint({ name: "IsAfter", async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
	validate(propertyValue: unknown, args: ValidationArguments) {
		const other = (args.object as Record<string, unknown>)[
			args.constraints[0]
		];

		if (propertyValue === undefined || other === undefined) {
			return true;
		}

		return (propertyValue as Date) > (other as Date);
	}

	defaultMessage(args: ValidationArguments) {
		return `"${args.property}" must be after "${args.constraints[0]}"`;
	}
}

/**
 * Validates that none of the named sibling properties are set (non-null,
 * non-undefined) when this property has a value.
 *
 * Typically paired with @ValidateIf(dto => !!dto.thisProperty) so the
 * constraint only fires when the property itself is present.
 */
@ValidatorConstraint({ name: "IsNotSetWith", async: false })
export class IsNotSetWithConstraint implements ValidatorConstraintInterface {
	validate(_value: unknown, args: ValidationArguments) {
		const object = args.object as Record<string, unknown>;

		return args.constraints.every(
			key => object[key] === undefined || object[key] === null
		);
	}

	defaultMessage(args: ValidationArguments) {
		const conflicting = args.constraints.join('", "');

		return `"${args.property}" cannot be used together with "${conflicting}"`;
	}
}
