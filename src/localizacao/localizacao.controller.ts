import { Controller, Get, Param } from '@nestjs/common';
import { LocalizacaoService } from './localizacao.service';

@Controller('localizacao')
export class LocalizacaoController {
    constructor(private readonly localizacaoService: LocalizacaoService){}
    //GET para localziar/cep/:cep
    @Get('cep/:cep')
    buscarCep(@Param('cep') cep: string){
        return this.localizacaoService.buscarCep(cep)
    }

    //GET pára localização/cidade/:cidade
    @Get('cidade/:cidade')
    buscarCidade(@Param('cidade') cidade:string){
        return this.localizacaoService.buscarCidade(cidade)
    }

    @Get('cep/:cep/coordenadas')
    buscarCepComCoordenadas(@Param('cep') cep:string){
        return this.localizacaoService.buscarCepComCoordenadas(cep)
    }
}