import { UMLModel, Visibility } from '../types/uml';

function toXmiVisibility(vis: Visibility): string {
  switch (vis) {
    case 'public':
      return 'public';
    case 'protected':
      return 'protected';
    case 'private':
    default:
      return 'private';
  }
}

/**
 * Generates UML 1.3/1.4 XMI file format compatible with IBM Rational Rose (Unisys XMI add-in)
 * and tools like StarUML, Enterprise Architect, Visual Paradigm
 */
export function generateXMI(model: UMLModel): string {
  const timestamp = new Date().toISOString();

  const classXml = model.classes.map((cls, idx) => {
    const attrXml = cls.attributes.map((attr, aIdx) => `
          <UML:Attribute xmi.id="attr_${idx}_${aIdx}" name="${attr.name}" visibility="${toXmiVisibility(attr.visibility)}">
            <UML:StructuralFeature.type>
              <UML:DataType xmi.idref="datatype_${attr.type || 'String'}" name="${attr.type || 'String'}"/>
            </UML:StructuralFeature.type>
          </UML:Attribute>`).join('');

    const operXml = cls.methods.map((method, mIdx) => {
      const paramXml = method.parameters.map((param, pIdx) => `
              <UML:Parameter xmi.id="param_${idx}_${mIdx}_${pIdx}" name="${param.name}" kind="in">
                <UML:Parameter.type>
                  <UML:DataType xmi.idref="datatype_${param.type || 'String'}" name="${param.type || 'String'}"/>
                </UML:Parameter.type>
              </UML:Parameter>`).join('');

      return `
          <UML:Operation xmi.id="oper_${idx}_${mIdx}" name="${method.name}" visibility="${toXmiVisibility(method.visibility)}">
            <UML:BehavioralFeature.parameter>
              <UML:Parameter xmi.id="return_${idx}_${mIdx}" name="return" kind="return">
                <UML:Parameter.type>
                  <UML:DataType xmi.idref="datatype_${method.returnType || 'void'}" name="${method.returnType || 'void'}"/>
                </UML:Parameter.type>
              </UML:Parameter>
              ${paramXml}
            </UML:BehavioralFeature.parameter>
          </UML:Operation>`;
    }).join('');

    return `
        <UML:Class xmi.id="cls_${idx}" name="${cls.name}" isAbstract="false">
          <UML:Classifier.feature>
            ${attrXml}
            ${operXml}
          </UML:Classifier.feature>
        </UML:Class>`;
  }).join('');

  const relXml = model.relationships.map((rel, rIdx) => {
    const srcIndex = model.classes.findIndex(c => c.name === rel.source);
    const tgtIndex = model.classes.findIndex(c => c.name === rel.target);

    if (rel.type === 'inheritance' || rel.type === 'realization') {
      return `
        <UML:Generalization xmi.id="gen_${rIdx}" name="${rel.label || ''}">
          <UML:Generalization.child>
            <UML:Class xmi.idref="cls_${srcIndex >= 0 ? srcIndex : 0}"/>
          </UML:Generalization.child>
          <UML:Generalization.parent>
            <UML:Class xmi.idref="cls_${tgtIndex >= 0 ? tgtIndex : 0}"/>
          </UML:Generalization.parent>
        </UML:Generalization>`;
    } else {
      return `
        <UML:Association xmi.id="assoc_${rIdx}" name="${rel.label || ''}">
          <UML:Association.connection>
            <UML:AssociationEnd xmi.id="end_src_${rIdx}" type="cls_${srcIndex >= 0 ? srcIndex : 0}" multiplicity="${rel.sourceMultiplicity || '1'}"/>
            <UML:AssociationEnd xmi.id="end_tgt_${rIdx}" type="cls_${tgtIndex >= 0 ? tgtIndex : 0}" multiplicity="${rel.targetMultiplicity || '1'}"/>
          </UML:Association.connection>
        </UML:Association>`;
    }
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<XMI xmi.version="1.2" xmlns:UML="org.omg.xmi.namespace.UML" timestamp="${timestamp}">
  <XMI.header>
    <XMI.documentation>
      <XMI.exporter>RoseUML AI</XMI.exporter>
      <XMI.exporterVersion>2.0</XMI.exporterVersion>
      <XMI.notice>Target: IBM Rational Rose / StarUML / EA / Visual Paradigm</XMI.notice>
    </XMI.documentation>
    <XMI.metamodel xmi.name="UML" xmi.version="1.4"/>
  </XMI.header>
  <XMI.content>
    <UML:Model xmi.id="model_root" name="${model.systemName}">
      <UML:Namespace.ownedElement>
        <!-- Classes and Relationships -->
        ${classXml}
        ${relXml}
      </UML:Namespace.ownedElement>
    </UML:Model>
  </XMI.content>
</XMI>
`;
}
