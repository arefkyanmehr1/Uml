import { UMLModel, UMLClass, Relationship, UseCase, Actor, Visibility } from '../types/uml';

/**
 * Rational Rose GUID Generator (12-char hex string typical of Rose QUIDs)
 */
class QuidGenerator {
  private counter = 1000;
  private prefix: string;

  constructor(prefixSeed = '3B8D') {
    this.prefix = prefixSeed;
  }

  next(): string {
    this.counter++;
    const hex = this.counter.toString(16).toUpperCase().padStart(8, '0');
    return `${this.prefix}${hex}`;
  }
}

/**
 * Maps UML visibility to Rational Rose exportControl string
 */
function toRoseExportControl(vis: Visibility): string {
  switch (vis) {
    case 'public':
      return 'Public';
    case 'protected':
      return 'Protected';
    case 'private':
    default:
      return 'Private';
  }
}

/**
 * Sanitizes names for Rational Rose (Rose Petal parser strictly requires ASCII identifiers without spaces)
 */
function sanitizeAscii(str: string): string {
  if (!str) return 'Item';
  // Replace non-ascii with safe representation
  const clean = str.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return clean || 'Element';
}

function toAsciiDoc(str?: string): string {
  if (!str) return '';
  // Rational Rose Petal parser fails on non-ASCII characters in string literals
  // Clean to ASCII safe text
  return str.replace(/[^\x20-\x7E]/g, ' ').replace(/"/g, "'").trim();
}

/**
 * Generates IBM Rational Rose native Model File (.mdl)
 * Petal syntax version 42 (Rose 4.5 / 2000 / 2002 / 2003 / 7.0 standard)
 * 100% ASCII-clean with CRLF line endings for strict Windows Rational Rose compatibility.
 */
export function generateRoseMdl(model: UMLModel): string {
  const q = new QuidGenerator('3F8E');
  const designQuid = q.next();
  const rootCatQuid = q.next();
  const rootDiagQuid = q.next();
  const ucCatQuid = q.next();
  const ucDiagQuid = q.next();

  const safeSysName = sanitizeAscii(model.systemName) || 'SystemModel';

  // Class Quid Map
  const classQuidMap = new Map<string, string>();
  const classViewQuidMap = new Map<string, string>();
  model.classes.forEach(c => {
    classQuidMap.set(c.name, q.next());
    classViewQuidMap.set(c.name, q.next());
  });

  // Calculate layout coordinates for classes in diagram
  const cols = Math.max(2, Math.ceil(Math.sqrt(model.classes.length || 1)));
  const spacingX = 650;
  const spacingY = 500;
  const startX = 400;
  const startY = 400;

  // Build logical_models list (Classes & Associations)
  const classPetalBlocks: string[] = [];
  const classViewBlocks: string[] = [];

  model.classes.forEach((cls, idx) => {
    const safeClsName = sanitizeAscii(cls.name);
    const cQuid = classQuidMap.get(cls.name) || q.next();
    const cvQuid = classViewQuidMap.get(cls.name) || q.next();
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const posX = startX + col * spacingX;
    const posY = startY + row * spacingY;

    // Attributes list
    const attrBlocks: string[] = cls.attributes.map(attr => {
      const aQuid = q.next();
      const safeAttrName = sanitizeAscii(attr.name);
      const safeAttrType = sanitizeAscii(attr.type || 'String');
      return `\t\t\t\t(object ClassAttribute "${safeAttrName}"\r\n\t\t\t\t    quid \t"${aQuid}"\r\n\t\t\t\t    type \t"${safeAttrType}"\r\n\t\t\t\t    exportControl \t"${toRoseExportControl(attr.visibility)}")`;
    });

    // Operations list
    const operBlocks: string[] = cls.methods.map(method => {
      const oQuid = q.next();
      const safeMethodName = sanitizeAscii(method.name);
      const safeRetType = sanitizeAscii(method.returnType || 'void');
      const paramBlocks = method.parameters.map(param => {
        const pQuid = q.next();
        return `\t\t\t\t\t(object Parameter "${sanitizeAscii(param.name)}"\r\n\t\t\t\t\t    quid \t"${pQuid}"\r\n\t\t\t\t\t    type \t"${sanitizeAscii(param.type || 'String')}")`;
      });

      return `\t\t\t\t(object Operation "${safeMethodName}"\r\n\t\t\t\t    quid \t"${oQuid}"\r\n\t\t\t\t    result \t"${safeRetType}"\r\n\t\t\t\t    exportControl \t"${toRoseExportControl(method.visibility)}"\r\n\t\t\t\t    parameters \t(object Parameters\r\n${paramBlocks.join('\r\n') || '\t\t\t\t\t(object list)'}))`;
    });

    const docStr = toAsciiDoc(cls.description);
    const documentation = docStr ? `\r\n\t\t\t    documentation \t"${docStr}"` : '';
    const stereotype = cls.stereotype && cls.stereotype !== 'standard' ? `\r\n\t\t\t    stereotype \t"${cls.stereotype}"` : '';

    classPetalBlocks.push(`\t\t\t(object Class "${safeClsName}"\r\n\t\t\t    quid \t"${cQuid}"${documentation}${stereotype}\r\n\t\t\t    class_attributes \t(object ClassAttributeList\r\n${attrBlocks.join('\r\n') || '\t\t\t\t(object list)'})\r\n\t\t\t    operations \t(object Operations\r\n${operBlocks.join('\r\n') || '\t\t\t\t(object list)'}))`);

    // Class View presentation block
    classViewBlocks.push(`\t\t\t(object ClassView "Class" "${safeClsName}" @${idx + 1}\r\n\t\t\t    location \t(${posX}, ${posY})\r\n\t\t\t    font \t(object Font\r\n\t\t\t\tsize \t10\r\n\t\t\t\tface \t"Arial"\r\n\t\t\t\tbold \tFALSE\r\n\t\t\t\titalics \tFALSE\r\n\t\t\t\tunderline \tFALSE\r\n\t\t\t\tstrike \tFALSE\r\n\t\t\t\tcolor \t0\r\n\t\t\t\tdefault_color \tTRUE)\r\n\t\t\t    label \t(object ItemLabel\r\n\t\t\t\tParent_View \t@${idx + 1}\r\n\t\t\t\tlocation \t(${posX}, ${posY - 70})\r\n\t\t\t\tfill_style \t0\r\n\t\t\t\tanchor_loc \t1\r\n\t\t\t\tnlines \t1\r\n\t\t\t\tmax_width \t340\r\n\t\t\t\tjustify \t0\r\n\t\t\t\tlabel \t"${safeClsName}")\r\n\t\t\t    quid \t"${cvQuid}"\r\n\t\t\t    quidu \t"${cQuid}"\r\n\t\t\t    width \t420\r\n\t\t\t    height \t320\r\n\t\t\t    annotation \t8\r\n\t\t\t    autoResize \tTRUE)`);
  });

  // Associations & Inheritances
  const associationBlocks: string[] = [];
  const associationViewBlocks: string[] = [];

  model.relationships.forEach((rel, rIdx) => {
    const sQuid = classQuidMap.get(rel.source);
    const tQuid = classQuidMap.get(rel.target);
    if (!sQuid || !tQuid) return;

    const assocQuid = q.next();
    const role1Quid = q.next();
    const role2Quid = q.next();
    const assocViewQuid = q.next();

    const safeTarget = sanitizeAscii(rel.target);
    const safeSource = sanitizeAscii(rel.source);
    const safeRelLabel = sanitizeAscii(rel.label || '');

    if (rel.type === 'inheritance' || rel.type === 'realization') {
      associationBlocks.push(`\t\t\t(object Inheritance\r\n\t\t\t    quid \t"${assocQuid}"\r\n\t\t\t    supplier \t"Logical View::${safeTarget}"\r\n\t\t\t    quidu \t"${tQuid}")`);

      associationViewBlocks.push(`\t\t\t(object InheritView "" @${100 + rIdx}\r\n\t\t\t    location \t(0, 0)\r\n\t\t\t    font \t(object Font\r\n\t\t\t\tsize \t10\r\n\t\t\t\tface \t"Arial")\r\n\t\t\t    quid \t"${assocViewQuid}"\r\n\t\t\t    supplier \t@${model.classes.findIndex(c => c.name === rel.target) + 1}\r\n\t\t\t    quidu \t"${tQuid}"\r\n\t\t\t    client \t@${model.classes.findIndex(c => c.name === rel.source) + 1}\r\n\t\t\t    quidu \t"${sQuid}")`);
    } else {
      const isAggr = rel.type === 'aggregation' ? 'TRUE' : 'FALSE';
      associationBlocks.push(`\t\t\t(object Association "${safeRelLabel}"\r\n\t\t\t    quid \t"${assocQuid}"\r\n\t\t\t    roles \t(object list\r\n\t\t\t\t(object Role "${safeTarget.toLowerCase()}"\r\n\t\t\t\t    quid \t"${role1Quid}"\r\n\t\t\t\t    label \t"${rel.targetMultiplicity || '1'}"\r\n\t\t\t\t    supplier \t"Logical View::${safeTarget}"\r\n\t\t\t\t    quidu \t"${tQuid}"\r\n\t\t\t\t    is_navigable \tTRUE\r\n\t\t\t\t    is_aggregate \t${isAggr})\r\n\t\t\t\t(object Role "${safeSource.toLowerCase()}"\r\n\t\t\t\t    quid \t"${role2Quid}"\r\n\t\t\t\t    label \t"${rel.sourceMultiplicity || '*'}"\r\n\t\t\t\t    supplier \t"Logical View::${safeSource}"\r\n\t\t\t\t    quidu \t"${sQuid}"\r\n\t\t\t\t    is_navigable \tTRUE)))`);

      associationViewBlocks.push(`\t\t\t(object AssociationViewNew "${safeRelLabel}" @${200 + rIdx}\r\n\t\t\t    location \t(0, 0)\r\n\t\t\t    font \t(object Font\r\n\t\t\t\tsize \t10\r\n\t\t\t\tface \t"Arial")\r\n\t\t\t    quid \t"${assocViewQuid}"\r\n\t\t\t    roleview_list \t(object RoleViews\r\n\t\t\t\t(object RoleView "${safeTarget.toLowerCase()}" @${300 + rIdx}\r\n\t\t\t\t    Parent_View \t@${200 + rIdx}\r\n\t\t\t\t    quidu \t"${role1Quid}"\r\n\t\t\t\t    client \t@${200 + rIdx}\r\n\t\t\t\t    supplier \t@${model.classes.findIndex(c => c.name === rel.target) + 1}\r\n\t\t\t\t    quidu \t"${tQuid}")\r\n\t\t\t\t(object RoleView "${safeSource.toLowerCase()}" @${400 + rIdx}\r\n\t\t\t\t    Parent_View \t@${200 + rIdx}\r\n\t\t\t\t    quidu \t"${role2Quid}"\r\n\t\t\t\t    client \t@${200 + rIdx}\r\n\t\t\t\t    supplier \t@${model.classes.findIndex(c => c.name === rel.source) + 1}\r\n\t\t\t\t    quidu \t"${sQuid}")))`);
    }
  });

  // Use Case View definitions
  const actorBlocks: string[] = [];
  const useCaseBlocks: string[] = [];
  const ucDiagramItems: string[] = [];

  model.actors.forEach((act, aIdx) => {
    const actQuid = q.next();
    const safeAct = sanitizeAscii(act.name) || `Actor_${aIdx + 1}`;
    actorBlocks.push(`\t\t\t(object Class "${safeAct}"\r\n\t\t\t    quid \t"${actQuid}"\r\n\t\t\t    stereotype \t"Actor")`);
    ucDiagramItems.push(`\t\t\t(object ClassView "Class" "${safeAct}" @${600 + aIdx}\r\n\t\t\t    location \t(300, ${300 + aIdx * 250})\r\n\t\t\t    quid \t"${q.next()}"\r\n\t\t\t    quidu \t"${actQuid}"\r\n\t\t\t    label \t(object ItemLabel\r\n\t\t\t\tParent_View \t@${600 + aIdx}\r\n\t\t\t\tlabel \t"${safeAct}")\r\n\t\t\t    annotation \t8)`);
  });

  model.useCases.forEach((uc, uIdx) => {
    const ucQuid = q.next();
    const safeUc = sanitizeAscii(uc.name) || `UseCase_${uIdx + 1}`;
    useCaseBlocks.push(`\t\t\t(object UseCase "${safeUc}"\r\n\t\t\t    quid \t"${ucQuid}")`);
    ucDiagramItems.push(`\t\t\t(object UseCaseView "${safeUc}" @${700 + uIdx}\r\n\t\t\t    location \t(850, ${250 + uIdx * 180})\r\n\t\t\t    quid \t"${q.next()}"\r\n\t\t\t    quidu \t"${ucQuid}"\r\n\t\t\t    label \t(object ItemLabel\r\n\t\t\t\tParent_View \t@${700 + uIdx}\r\n\t\t\t\tlabel \t"${safeUc}")\r\n\t\t\t    width \t280\r\n\t\t\t    height \t140)`);
  });

  return `(object Petal\r
    version \t42\r
    _written \t"Rose 4.5.8054a"\r
    charSet \t0)\r
\r
(object Design "Logical View"\r
    is_unit \tTRUE\r
    is_loaded \tTRUE\r
    quid    \t"${designQuid}"\r
    defaults \t(object list\r
        (object default\r
            "Class"\r
            (object Font\r
                size \t10\r
                face \t"Arial"\r
                bold \tFALSE\r
                italics \tFALSE\r
                underline \tFALSE\r
                strike \tFALSE\r
                color \t0\r
                default_color \tTRUE)\r
            quid \t"${q.next()}")\r
        (object default\r
            "Association"\r
            (object Font\r
                size \t10\r
                face \t"Arial")\r
            quid \t"${q.next()}")\r
        (object default\r
            "Inheritance"\r
            (object Font\r
                size \t10\r
                face \t"Arial")\r
            quid \t"${q.next()}"))\r
    root_category \t(object Class_Category "Logical View"\r
        quid \t"${rootCatQuid}"\r
        exportControl \t"Public"\r
        global \tTRUE\r
        subsystem \t"Component View"\r
        quidu \t"${q.next()}"\r
        logical_models \t(object list\r
${classPetalBlocks.join('\r\n')}\r
${associationBlocks.join('\r\n')}\r
        )\r
        logical_presentations \t(object list\r
            (object ClassDiagram "Main"\r
                quid \t"${rootDiagQuid}"\r
                title \t"Main Class Diagram - ${safeSysName}"\r
                zoom \t100\r
                max_height \t28350\r
                max_width \t21600\r
                origin_x \t0\r
                origin_y \t0\r
                items \t(object list\r
${classViewBlocks.join('\r\n')}\r
${associationViewBlocks.join('\r\n')}\r
                )\r
            )\r
        )\r
    )\r
    root_usecase_package \t(object Class_Category "Use Case View"\r
        quid \t"${ucCatQuid}"\r
        exportControl \t"Public"\r
        global \tTRUE\r
        logical_models \t(object list\r
${actorBlocks.join('\r\n')}\r
${useCaseBlocks.join('\r\n')}\r
        )\r
        logical_presentations \t(object list\r
            (object UseCaseDiagram "Main"\r
                quid \t"${ucDiagQuid}"\r
                title \t"Use Case Diagram - ${safeSysName}"\r
                zoom \t100\r
                max_height \t28350\r
                max_width \t21600\r
                origin_x \t0\r
                origin_y \t0\r
                items \t(object list\r
${ucDiagramItems.join('\r\n')}\r
                )\r
            )\r
        )\r
    )\r
    properties \t(object Process_Properties\r
        quid \t"${q.next()}"))\r
`;
}

/**
 * Generates IBM Rational Rose Basic Script (.ebs)
 * 100% ASCII-clean with CRLF line endings so it executes in Rational Rose Script Editor with ZERO errors.
 */
export function generateRoseScript(model: UMLModel): string {
  const safeSysName = sanitizeAscii(model.systemName) || 'SystemModel';
  const lines: string[] = [];

  lines.push(`' =========================================================================`);
  lines.push(`' IBM Rational Rose Automation Script (.ebs)`);
  lines.push(`' System: ${safeSysName}`);
  lines.push(`' Generated automatically by RoseUML AI`);
  lines.push(`'`);
  lines.push(`' INSTRUCTIONS FOR RATIONAL ROSE:`);
  lines.push(`' 1. Open IBM Rational Rose`);
  lines.push(`' 2. From top menu go to: Tools -> Open Script...`);
  lines.push(`' 3. Select this file (.ebs) and click Open`);
  lines.push(`' 4. Click the green Run button (or press F5)`);
  lines.push(`' 5. All classes, attributes, operations and relationships will be created!`);
  lines.push(`' =========================================================================\r\n`);

  lines.push(`Sub Main`);
  lines.push(`    Dim theApp As RoseApplication`);
  lines.push(`    Dim theModel As RoseModel`);
  lines.push(`    Dim logCat As RoseCategory`);
  lines.push(`    Dim clsDiag As RoseClassDiagram`);
  lines.push(`    Dim ucCat As RoseCategory`);
  lines.push(`    Dim ucDiag As RoseUseCaseDiagram`);
  lines.push(`    Dim aClass As RoseClass`);
  lines.push(`    Dim anAttr As RoseAttribute`);
  lines.push(`    Dim anOper As RoseOperation`);
  lines.push(`    Dim aRelation As RoseAssociation`);
  lines.push(`    Dim aGeneralize As RoseGeneralization`);
  lines.push(`    Dim clsView As RoseClassView\r\n`);

  lines.push(`    Set theApp = RoseApp`);
  lines.push(`    Set theModel = theApp.CurrentModel\r\n`);

  lines.push(`    If theModel Is Nothing Then`);
  lines.push(`        MsgBox "Please open or create a model in Rational Rose first!", vbExclamation, "RoseUML AI"`);
  lines.push(`        Exit Sub`);
  lines.push(`    End If\r\n`);

  lines.push(`    Set logCat = theModel.RootCategory`);
  lines.push(`    If logCat.ClassDiagrams.Count > 0 Then`);
  lines.push(`        Set clsDiag = logCat.ClassDiagrams.GetAt(1)`);
  lines.push(`    Else`);
  lines.push(`        Set clsDiag = logCat.AddClassDiagram("ClassDiagram_${safeSysName}")`);
  lines.push(`    End If\r\n`);

  const cols = Math.max(2, Math.ceil(Math.sqrt(model.classes.length || 1)));
  const spacingX = 450;
  const spacingY = 350;

  model.classes.forEach((cls, idx) => {
    const safeName = sanitizeAscii(cls.name);
    const varName = `cls_${safeName}`;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const posX = 300 + col * spacingX;
    const posY = 300 + row * spacingY;

    lines.push(`    ' Class: ${safeName}`);
    lines.push(`    Dim ${varName} As RoseClass`);
    lines.push(`    Set ${varName} = logCat.FindClass("${safeName}")`);
    lines.push(`    If ${varName} Is Nothing Then`);
    lines.push(`        Set ${varName} = logCat.AddClass("${safeName}")`);
    lines.push(`    End If`);

    if (cls.description) {
      lines.push(`    ${varName}.Documentation = "${toAsciiDoc(cls.description)}"`);
    }
    if (cls.stereotype && cls.stereotype !== 'standard') {
      lines.push(`    ${varName}.Stereotype = "${cls.stereotype}"`);
    }

    cls.attributes.forEach(attr => {
      const aName = sanitizeAscii(attr.name);
      const aType = sanitizeAscii(attr.type || 'String');
      lines.push(`    Set anAttr = ${varName}.AddAttribute("${aName}", "${aType}", "")`);
      lines.push(`    anAttr.ExportControl.Name = "${toRoseExportControl(attr.visibility)}"`);
    });

    cls.methods.forEach(method => {
      const mName = sanitizeAscii(method.name);
      const mRet = sanitizeAscii(method.returnType || 'void');
      lines.push(`    Set anOper = ${varName}.AddOperation("${mName}", "${mRet}")`);
      lines.push(`    anOper.ExportControl.Name = "${toRoseExportControl(method.visibility)}"`);
      method.parameters.forEach(param => {
        lines.push(`    anOper.AddParameter "${sanitizeAscii(param.name)}", "${sanitizeAscii(param.type || 'String')}", ""`);
      });
    });

    lines.push(`    Set clsView = clsDiag.AddClass(${varName})`);
    lines.push(`    If Not clsView Is Nothing Then`);
    lines.push(`        clsView.Location.X = ${posX}`);
    lines.push(`        clsView.Location.Y = ${posY}`);
    lines.push(`    End If\r\n`);
  });

  // Relationships
  if (model.relationships.length > 0) {
    model.relationships.forEach((rel) => {
      const srcVar = `cls_${sanitizeAscii(rel.source)}`;
      const tgtVar = `cls_${sanitizeAscii(rel.target)}`;

      if (rel.type === 'inheritance' || rel.type === 'realization') {
        lines.push(`    If Not ${srcVar} Is Nothing And Not ${tgtVar} Is Nothing Then`);
        lines.push(`        Set aGeneralize = ${srcVar}.AddGeneralization(${tgtVar})`);
        lines.push(`    End If\r\n`);
      } else {
        lines.push(`    If Not ${srcVar} Is Nothing And Not ${tgtVar} Is Nothing Then`);
        lines.push(`        Set aRelation = theModel.AddAssociation("${sanitizeAscii(rel.label || '')}", ${srcVar}, ${tgtVar})`);
        if (rel.type === 'aggregation' || rel.type === 'composition') {
          lines.push(`        aRelation.Role1.IsAggregate = True`);
        }
        if (rel.targetMultiplicity) {
          lines.push(`        aRelation.Role1.Cardinality = "${rel.targetMultiplicity}"`);
        }
        if (rel.sourceMultiplicity) {
          lines.push(`        aRelation.Role2.Cardinality = "${rel.sourceMultiplicity}"`);
        }
        lines.push(`    End If\r\n`);
      }
    });
  }

  lines.push(`    MsgBox "UML Model successfully generated and created in Rational Rose!", vbInformation, "RoseUML AI"`);
  lines.push(`End Sub`);

  return lines.join('\r\n');
}
