export type Visibility = 'public' | 'private' | 'protected' | 'package';

export interface Attribute {
  name: string;
  type: string;
  visibility: Visibility;
  defaultValue?: string;
  description?: string;
}

export interface Parameter {
  name: string;
  type: string;
}

export interface Method {
  name: string;
  returnType: string;
  visibility: Visibility;
  parameters: Parameter[];
  isStatic?: boolean;
  isAbstract?: boolean;
  description?: string;
}

export type Stereotype = 'entity' | 'control' | 'boundary' | 'interface' | 'abstract' | 'enum' | 'standard';

export interface UMLClass {
  id: string;
  name: string;
  persianName?: string;
  stereotype?: Stereotype;
  description?: string;
  packageName?: string;
  attributes: Attribute[];
  methods: Method[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type RelationshipType = 
  | 'inheritance' 
  | 'realization' 
  | 'association' 
  | 'aggregation' 
  | 'composition' 
  | 'dependency';

export interface Relationship {
  id: string;
  source: string; // class name or id
  target: string; // class name or id
  type: RelationshipType;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
  description?: string;
}

export interface UseCase {
  id: string;
  name: string;
  description?: string;
  actors: string[];
  includes?: string[];
  extends?: string[];
}

export interface Actor {
  id: string;
  name: string;
  description?: string;
}

export interface SequenceMessage {
  from: string;
  to: string;
  message: string;
  sequenceType?: 'sync' | 'async' | 'return';
  order: number;
}

export interface SequenceDiagram {
  id: string;
  title: string;
  participants: string[];
  messages: SequenceMessage[];
}

export type FlowchartNodeType = 'start' | 'process' | 'decision' | 'io' | 'end';

export interface FlowchartNode {
  id: string;
  type: FlowchartNodeType;
  label: string;
  description?: string;
  subtext?: string;
  x?: number;
  y?: number;
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Flowchart {
  title: string;
  description: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface UMLModel {
  id: string;
  systemName: string;
  description: string;
  targetFramework?: string;
  classes: UMLClass[];
  relationships: Relationship[];
  useCases: UseCase[];
  actors: Actor[];
  sequenceDiagrams?: SequenceDiagram[];
  flowchart?: Flowchart;
  createdAt: string;
}
