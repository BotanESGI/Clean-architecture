import { NestFactory } from '@nestjs/core';
import { Module, Controller, Post, Body, Get } from '@nestjs/common';
import { InMemoryAccountRepo } from '../../infrastructure/adapters/in-memory/InMemoryAccountRepo';
import { TransferFunds } from '../../application/use-cases/TransferFunds';
import { Account } from '../../domain/entities/Account';
import { IBAN } from '../../domain/value-objects/IBAN';

const repo = new InMemoryAccountRepo();

// Créons deux comptes au démarrage pour tester :
const acc1 = new Account("1", "client1", "Compte Principal", IBAN.generateFR(), 1000);
const acc2 = new Account("2", "client2", "Compte Épargne", IBAN.generateFR(), 500);
repo.create(acc1);
repo.create(acc2);

@Controller('accounts')
class AccountsController {
    @Get()
    list() {
        return repo.listAll();
    }

    @Post('transfer')
    async transfer(@Body() body: { fromIban: string; toIban: string; amount: number }) {
        const usecase = new TransferFunds(repo);
        return usecase.execute(body.fromIban, body.toIban, body.amount);
    }
}

@Module({
    controllers: [AccountsController],
})
class AppModule {}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.listen(3000);
    console.log('✅ Backend running on http://localhost:3000');
    console.log('💡 Comptes disponibles :');
    console.log(repo.listAll());
}
bootstrap();
