import { UMLModel, Visibility } from '../types/uml';

function toVisibilitySymbol(vis: Visibility): string {
  switch (vis) {
    case 'public':
      return '+';
    case 'protected':
      return '#';
    case 'private':
    default:
      return '-';
  }
}

export function generatePlantUml(model: UMLModel): string {
  const lines: string[] = [];
  lines.push('@startuml');
  lines.push(`title Class Diagram - ${model.systemName}`);
  lines.push('skinparam classAttributeIconSize 0');
  lines.push('skinparam monochrome false');
  lines.push('skinparam shadowing true');
  lines.push('skinparam defaultFontName Arial');
  lines.push('');

  // Classes
  model.classes.forEach(cls => {
    const stereotype = cls.stereotype && cls.stereotype !== 'standard' ? ` <<${cls.stereotype}>>` : '';
    lines.push(`class ${cls.name}${stereotype} {`);

    cls.attributes.forEach(attr => {
      const sym = toVisibilitySymbol(attr.visibility);
      lines.push(`  ${sym}${attr.name} : ${attr.type || 'String'}`);
    });

    if (cls.methods.length > 0) {
      lines.push('  --');
      cls.methods.forEach(method => {
        const sym = toVisibilitySymbol(method.visibility);
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        lines.push(`  ${sym}${method.name}(${params}) : ${method.returnType || 'void'}`);
      });
    }

    lines.push('}');
    lines.push('');
  });

  // Relationships
  model.relationships.forEach(rel => {
    let arrow = '--';
    const srcMult = rel.sourceMultiplicity ? `"${rel.sourceMultiplicity}" ` : '';
    const tgtMult = rel.targetMultiplicity ? ` "${rel.targetMultiplicity}"` : '';
    const label = rel.label ? ` : ${rel.label}` : '';

    switch (rel.type) {
      case 'inheritance':
        arrow = '<|--';
        lines.push(`${rel.target} ${arrow} ${rel.source}${label}`);
        break;
      case 'realization':
        arrow = '<|..';
        lines.push(`${rel.target} ${arrow} ${rel.source}${label}`);
        break;
      case 'aggregation':
        arrow = 'o--';
        lines.push(`${rel.source} ${srcMult}${arrow}${tgtMult} ${rel.target}${label}`);
        break;
      case 'composition':
        arrow = '*--';
        lines.push(`${rel.source} ${srcMult}${arrow}${tgtMult} ${rel.target}${label}`);
        break;
      case 'dependency':
        arrow = '..>';
        lines.push(`${rel.source} ${srcMult}${arrow}${tgtMult} ${rel.target}${label}`);
        break;
      case 'association':
      default:
        arrow = '-->';
        lines.push(`${rel.source} ${srcMult}${arrow}${tgtMult} ${rel.target}${label}`);
        break;
    }
  });

  lines.push('');
  lines.push('@enduml');
  return lines.join('\n');
}

export function generatePlantUmlUseCase(model: UMLModel): string {
  const lines: string[] = [];
  lines.push('@startuml');
  lines.push(`title Use Case Diagram - ${model.systemName}`);
  lines.push('left to right direction');
  lines.push('skinparam defaultFontName Arial');
  lines.push('');

  model.actors.forEach(act => {
    lines.push(`actor "${act.name}" as ${act.name.replace(/[^a-zA-Z0-9]/g, '_')}`);
  });

  lines.push('');
  lines.push(`rectangle "${model.systemName}" {`);
  model.useCases.forEach(uc => {
    const ucId = uc.id || uc.name.replace(/[^a-zA-Z0-9]/g, '_');
    lines.push(`  usecase "${uc.name}" as ${ucId}`);
  });
  lines.push('}');
  lines.push('');

  // Connections
  model.useCases.forEach(uc => {
    const ucId = uc.id || uc.name.replace(/[^a-zA-Z0-9]/g, '_');
    uc.actors.forEach(actName => {
      const actId = actName.replace(/[^a-zA-Z0-9]/g, '_');
      lines.push(`${actId} --> ${ucId}`);
    });
    if (uc.includes) {
      uc.includes.forEach(inc => {
        lines.push(`${ucId} ..> (${inc}) : <<include>>`);
      });
    }
    if (uc.extends) {
      uc.extends.forEach(ext => {
        lines.push(`${ucId} ..> (${ext}) : <<extend>>`);
      });
    }
  });

  lines.push('');
  lines.push('@enduml');
  return lines.join('\n');
}

export function generateMermaidClassDiagram(model: UMLModel): string {
  const lines: string[] = [];
  lines.push('classDiagram');

  model.classes.forEach(cls => {
    lines.push(`  class ${cls.name} {`);
    cls.attributes.forEach(attr => {
      const sym = toVisibilitySymbol(attr.visibility);
      lines.push(`    ${sym}${attr.type || 'String'} ${attr.name}`);
    });
    cls.methods.forEach(method => {
      const sym = toVisibilitySymbol(method.visibility);
      const params = method.parameters.map(p => `${p.type} ${p.name}`).join(', ');
      lines.push(`    ${sym}${method.name}(${params}) ${method.returnType || 'void'}`);
    });
    lines.push('  }');
  });

  model.relationships.forEach(rel => {
    switch (rel.type) {
      case 'inheritance':
        lines.push(`  ${rel.target} <|-- ${rel.source}`);
        break;
      case 'realization':
        lines.push(`  ${rel.target} <|.. ${rel.source}`);
        break;
      case 'aggregation':
        lines.push(`  ${rel.source} o-- ${rel.target}`);
        break;
      case 'composition':
        lines.push(`  ${rel.source} *-- ${rel.target}`);
        break;
      case 'dependency':
        lines.push(`  ${rel.source} ..> ${rel.target}`);
        break;
      case 'association':
      default:
        lines.push(`  ${rel.source} --> ${rel.target}`);
        break;
    }
  });

  return lines.join('\n');
}
