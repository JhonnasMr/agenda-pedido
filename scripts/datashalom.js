import { mkdirSync, writeFileSync } from 'fs';

async function main() {
  const response = await fetch(
    'https://api.shalom-api.lat/public/agencies'
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();

  const agencias = result.data.map((agencia) => ({
    name: agencia.lugar_over,
    place: `${agencia.departamento} / ${agencia.provincia} / ${agencia.lugar_over}`,
    reference: agencia.direccion,
  }));

  const contenido = `export const agencias = ${JSON.stringify(
    agencias,
    null,
    2
  )};\n`;

  mkdirSync('./src/data', { recursive: true });

  writeFileSync(
    './src/data/agencias.js',
    contenido,
    'utf8'
  );

  console.log(`✅ ${agencias.length} agencias guardadas`);
}

main().catch(console.error);