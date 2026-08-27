import { Injectable, BadRequestException/*quando a requisição da errado(404)*/, NotFoundException, ServiceUnavailableException/*quando servidor esta inativo */ } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';/*Nossa REquisição pra api(trabalha com Observable)*/

import { lastValueFrom } from 'rxjs';//na api do cep tem varias informações(varios valores em diferentes lugares), o last transforma o observable em uma Promisse que podemos utilizar atraves do await

@Injectable()
export class LocalizacaoService {
    constructor (private readonly httpService: HttpService){}

    //Consulta por CEP

    //Função responsavel po requisitar da  API o cep digitidado pelo usuário 
    async buscarCep(cep:string){
        //Remove qualquer carctere que não seja numero
        //Ex 01001-000 vira 01001000 (isso facilita a leitura da api)
        const cepLimpo = cep.replace(/\D/g, '')//o valor que o usuario inserir vai pra dentro de "cep" ele vai tratar e manda pro cepLimpo

        if(cepLimpo.length !== 8){//o ViaCEO trabalha com ceps de extamente 8 numero
            throw new BadRequestException("O CEP DEVE POSSUIR 8 NÚMEROS")
        }

        try{
            //Assim fazemos uma requisição para a api externa e armazenamos dentro de 'resposta'
            //
            const resposta = await lastValueFrom(
                this.httpService.get(`https://viacep.com.br/ws$${cepLimpo}/json`)
            )
            //O conteúdo pela API fica dentro da prioridade data
            const dados = resposta.data
            //Quando o cep não existe a API retorna "erro": "true", então nós traduzimos isso para o usuário como 'Cep não encontrado
            if(dados.erro){
                throw new NotFoundException('CEP não encontrado')
            }
            return{
                cep: dados.cep,
                logradouro: dados.logradouro,
                bairro: dados.bairro,
                cidade: dados.localidade,
                estado: dados.uf,
                regiao: dados.regiao
            }
        }catch(erro){
            if(
                erro instanceof NotFoundException || erro instanceof
                BadRequestException
            ){
                throw erro
            }
            throw new ServiceUnavailableException('Não foi possivel consultar o serviço de CEP')
        }
    }
}