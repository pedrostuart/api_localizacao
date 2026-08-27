import { Module } from '@nestjs/common';
import { LocalizacaoController } from './localizacao.controller';
import { LocalizacaoService } from './localizacao.service';
import { HttpModule } from '@nestjs/axios';// axios é a dependencia que a gente usa pra consegui trazer uma api externa

@Module({
  imports:[HttpModule],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService]
})
export class LocalizacaoModule {}