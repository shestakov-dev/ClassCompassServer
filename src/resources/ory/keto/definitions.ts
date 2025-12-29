// --- Namespace Definitions ---

export enum KetoNamespace {
	Identity = "Identity",
	Platform = "Platform",

	School = "School",

	Building = "Building",
	Subject = "Subject",
	User = "User",
	Class = "Class",

	Teacher = "Teacher",
	Student = "Student",
	Floor = "Floor",
	DailySchedule = "DailySchedule",

	Room = "Room",
	Lesson = "Lesson",
}

// Used when creating and deleting relationships
type KetoNamespaceRelations = {
	[KetoNamespace.Identity]: never;
	[KetoNamespace.Platform]: "admins";

	[KetoNamespace.School]: "admins" | "members" | "parentPlatform";

	[KetoNamespace.Building]: "parentSchool";
	[KetoNamespace.Subject]: "parentSchool";
	[KetoNamespace.User]: "parentSchool";
	[KetoNamespace.Class]: "parentSchool";

	[KetoNamespace.Teacher]: "parentUser";
	[KetoNamespace.Student]: "parentUser";
	[KetoNamespace.Floor]: "parentBuilding";
	[KetoNamespace.DailySchedule]: "parentClass";

	[KetoNamespace.Room]: "parentFloor";
	[KetoNamespace.Lesson]: "parentDailySchedule";
};

// Used when checking permissions
type KetoNamespacePermissions = {
	[KetoNamespace.Identity]: never;
	[KetoNamespace.Platform]: "manage";

	[KetoNamespace.School]: "manage" | "view";

	[KetoNamespace.Building]: "manage" | "view";
	[KetoNamespace.Subject]: "manage" | "view";
	[KetoNamespace.User]: "manage" | "view";
	[KetoNamespace.Class]: "manage" | "view";

	[KetoNamespace.Teacher]: "manage" | "view";
	[KetoNamespace.Student]: "manage" | "view";
	[KetoNamespace.Floor]: "manage" | "view";
	[KetoNamespace.DailySchedule]: "manage" | "view";

	[KetoNamespace.Room]: "manage" | "view";
	[KetoNamespace.Lesson]: "manage" | "view";
};

// When doing checks we might want to check for either a relation or a permission
export type NamespaceCheckable<Namespace extends KetoNamespace> =
	| KetoNamespaceRelations[Namespace]
	| KetoNamespacePermissions[Namespace];

// --- Hierarchy Definitions ---

// All namespaces that have a parent namespace
export type KetoChildNamespace = Exclude<
	KetoNamespace,
	KetoNamespace.Identity | KetoNamespace.Platform
>;

interface HierarchyConfig<ChildNamespace extends KetoChildNamespace> {
	parentNamespace: KetoNamespace;
	parentRelation: KetoNamespaceRelations[ChildNamespace];
}

// Define the hierarchy for namespaces that have parents
export const KetoHierarchy: {
	[ChildNamespace in KetoChildNamespace]: HierarchyConfig<ChildNamespace>;
} = {
	[KetoNamespace.School]: {
		parentNamespace: KetoNamespace.Platform,
		parentRelation: "parentPlatform",
	},

	[KetoNamespace.Building]: {
		parentNamespace: KetoNamespace.School,
		parentRelation: "parentSchool",
	},
	[KetoNamespace.Subject]: {
		parentNamespace: KetoNamespace.School,
		parentRelation: "parentSchool",
	},
	[KetoNamespace.User]: {
		parentNamespace: KetoNamespace.School,
		parentRelation: "parentSchool",
	},
	[KetoNamespace.Class]: {
		parentNamespace: KetoNamespace.School,
		parentRelation: "parentSchool",
	},

	[KetoNamespace.Teacher]: {
		parentNamespace: KetoNamespace.User,
		parentRelation: "parentUser",
	},
	[KetoNamespace.Student]: {
		parentNamespace: KetoNamespace.User,
		parentRelation: "parentUser",
	},
	[KetoNamespace.Floor]: {
		parentNamespace: KetoNamespace.Building,
		parentRelation: "parentBuilding",
	},
	[KetoNamespace.DailySchedule]: {
		parentNamespace: KetoNamespace.Class,
		parentRelation: "parentClass",
	},

	[KetoNamespace.Room]: {
		parentNamespace: KetoNamespace.Floor,
		parentRelation: "parentFloor",
	},
	[KetoNamespace.Lesson]: {
		parentNamespace: KetoNamespace.DailySchedule,
		parentRelation: "parentDailySchedule",
	},
} as const;

// --- Keto Tuple Definitions ---

interface KetoSubjectSet {
	namespace: KetoNamespace;
	object: string;
	relation?: string;
}

interface TupleHeader<Namespace extends KetoNamespace, RelationType> {
	namespace: Namespace;
	object: string;
	relation: RelationType;
}

interface WithSubjectId {
	subjectId: string;
	subjectSet?: undefined;
}

interface WithSubjectSet {
	subjectSet: KetoSubjectSet;
	subjectId?: undefined;
}

type GenericKetoTuple<
	Namespace extends KetoNamespace,
	RelationType,
> = TupleHeader<Namespace, RelationType> & (WithSubjectId | WithSubjectSet);

export type KetoWriteTuple<Namespace extends KetoNamespace = KetoNamespace> =
	GenericKetoTuple<Namespace, KetoNamespaceRelations[Namespace]>;

export type KetoCheckTuple<Namespace extends KetoNamespace = KetoNamespace> =
	GenericKetoTuple<Namespace, NamespaceCheckable<Namespace>>;
