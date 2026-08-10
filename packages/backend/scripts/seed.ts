import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

async function main() {
  // createApplicationContext executa o ciclo de vida, incluindo onApplicationBootstrap
  // do SeedService, que roda as seeds automaticamente.
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('Seeds concluídas com sucesso.');
  await app.close();
}

main().catch((err) => {
  console.error('Erro ao rodar seeds:', err);
  process.exit(1);
});
