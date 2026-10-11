import { UMLModel, UMLClass, Visibility } from '../types/uml';

function toJavaVisibility(vis: Visibility): string {
  switch (vis) {
    case 'public':
      return 'public ';
    case 'protected':
      return 'protected ';
    case 'private':
      return 'private ';
    default:
      return '';
  }
}

function mapToJavaType(type: string): string {
  const t = type.toLowerCase();
  if (t === 'string' || t === 'str') return 'String';
  if (t === 'int' || t === 'integer') return 'int';
  if (t === 'double' || t === 'float') return 'double';
  if (t === 'boolean' || t === 'bool') return 'boolean';
  if (t === 'date' || t === 'datetime') return 'java.util.Date';
  if (t.includes('[]') || t.includes('list')) return 'java.util.List<Object>';
  return type;
}

export function generateJavaCode(cls: UMLClass, model: UMLModel): string {
  // Check inheritance
  const parentRel = model.relationships.find(
    r => r.source === cls.name && r.type === 'inheritance'
  );
  const extendsClause = parentRel ? ` extends ${parentRel.target}` : '';

  const implementsRels = model.relationships
    .filter(r => r.source === cls.name && r.type === 'realization')
    .map(r => r.target);
  const implementsClause = implementsRels.length > 0 ? ` implements ${implementsRels.join(', ')}` : '';

  const lines: string[] = [];
  lines.push(`/**`);
  lines.push(` * Class: ${cls.name}`);
  if (cls.description) lines.push(` * ${cls.description}`);
  lines.push(` * Generated for IBM Rational Rose / SE project`);
  lines.push(` */`);
  lines.push(`public class ${cls.name}${extendsClause}${implementsClause} {`);

  // Fields
  lines.push(`    // Attributes`);
  cls.attributes.forEach(attr => {
    const vis = toJavaVisibility(attr.visibility);
    const jType = mapToJavaType(attr.type);
    const def = attr.defaultValue ? ` = ${attr.defaultValue}` : '';
    lines.push(`    ${vis}${jType} ${attr.name}${def};`);
  });

  lines.push(`\n    // Constructor`);
  lines.push(`    public ${cls.name}() {`);
  lines.push(`        // Default constructor`);
  lines.push(`    }`);

  // Methods
  lines.push(`\n    // Methods`);
  cls.methods.forEach(method => {
    const vis = toJavaVisibility(method.visibility);
    const retType = mapToJavaType(method.returnType);
    const params = method.parameters
      .map(p => `${mapToJavaType(p.type)} ${p.name}`)
      .join(', ');

    lines.push(`    ${vis}${retType} ${method.name}(${params}) {`);
    if (retType === 'void') {
      lines.push(`        // TODO: Implement ${method.name}`);
    } else if (retType === 'boolean') {
      lines.push(`        return false;`);
    } else if (retType === 'int' || retType === 'double') {
      lines.push(`        return 0;`);
    } else {
      lines.push(`        return null;`);
    }
    lines.push(`    }\n`);
  });

  lines.push(`}`);
  return lines.join('\n');
}

export function generateCppCode(cls: UMLClass, model: UMLModel): string {
  const parentRel = model.relationships.find(
    r => r.source === cls.name && r.type === 'inheritance'
  );
  const extendsClause = parentRel ? ` : public ${parentRel.target}` : '';

  const lines: string[] = [];
  lines.push(`#ifndef ${cls.name.toUpperCase()}_H`);
  lines.push(`#define ${cls.name.toUpperCase()}_H`);
  lines.push(`#include <string>`);
  lines.push(`#include <vector>\n`);
  lines.push(`class ${cls.name}${extendsClause} {`);

  // Private fields
  const privateAttrs = cls.attributes.filter(a => a.visibility === 'private');
  if (privateAttrs.length > 0) {
    lines.push(`private:`);
    privateAttrs.forEach(a => lines.push(`    std::string ${a.name};`));
  }

  // Protected fields
  const protectedAttrs = cls.attributes.filter(a => a.visibility === 'protected');
  if (protectedAttrs.length > 0) {
    lines.push(`protected:`);
    protectedAttrs.forEach(a => lines.push(`    std::string ${a.name};`));
  }

  // Public
  lines.push(`public:`);
  lines.push(`    ${cls.name}();`);
  lines.push(`    virtual ~${cls.name}();`);
  cls.methods.forEach(m => {
    const params = m.parameters.map(p => `${p.type || 'std::string'} ${p.name}`).join(', ');
    lines.push(`    ${m.returnType || 'void'} ${m.name}(${params});`);
  });

  lines.push(`};`);
  lines.push(`\n#endif // ${cls.name.toUpperCase()}_H`);
  return lines.join('\n');
}

export function generatePythonCode(cls: UMLClass, model: UMLModel): string {
  const parentRel = model.relationships.find(
    r => r.source === cls.name && r.type === 'inheritance'
  );
  const baseClass = parentRel ? `(${parentRel.target})` : '';

  const lines: string[] = [];
  lines.push(`class ${cls.name}${baseClass}:`);
  lines.push(`    """${cls.description || cls.name + ' class'}"""\n`);

  lines.push(`    def __init__(self):`);
  if (parentRel) {
    lines.push(`        super().__init__()`);
  }
  if (cls.attributes.length === 0) {
    lines.push(`        pass`);
  } else {
    cls.attributes.forEach(a => {
      const prefix = a.visibility === 'private' ? '__' : a.visibility === 'protected' ? '_' : '';
      lines.push(`        self.${prefix}${a.name} = None`);
    });
  }

  cls.methods.forEach(m => {
    const params = ['self', ...m.parameters.map(p => p.name)].join(', ');
    lines.push(`\n    def ${m.name}(${params}):`);
    lines.push(`        """${m.description || 'Method ' + m.name}"""`);
    lines.push(`        pass`);
  });

  return lines.join('\n');
}
