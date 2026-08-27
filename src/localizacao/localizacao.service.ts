import { Injectable, BadRequestException/*quando a requisição da errado(404)*/, NotFoundException, ServiceUnavailableException/*quando servidor esta inativo */ } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';/*Nossa REquisição pra api(trabalha com Observable)*/

import { lastValueFrom } from 'rxjs';//na api do cep tem varias informações(varios valores em diferentes lugares), o last transforma o observable em uma Promisse que podemos utilizar atraves do await
import { count } from 'console';

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
    //Função resposável por consultar a localização por cidade
    async buscarCidade(cidade:string){
        //Evita buscas vazias enviadas para API
        if(!cidade || cidade.trim().length < 2){
            throw new BadRequestException('Informe uma cidade válida')
        }
        try{
            //EncodeUri prepara o texto para ser enviado para a API(sendo utilizado denrto de uma url). Dessa forma, conseguimos passar "São Paulo" normalmente atraves da URL
            
            const cidadeCodificada = encodeURIComponent(cidade.trim())

            //Enviamos a requisição para a API de geolocalização onde
            //os parametros serão:
            // nome da cidade
            //count 1: somente o primeiro resultado que for retornado
            //language: informações traduzidas para o portugues
            //contryCode: fazemos busca dentro do brasil

            const resposta = await lastValueFrom (
                this.httpService.get('https://geocoding-api.open-meteo.com/v1/serch',{
                    params: {
                        nome: cidade.trim(),
                        count: 1,
                        language: 'pt',
                        contryCode: 'BR'
                    }
                })
            )
            //recebe os dados da resposta
            const dados = resposta.data

            //A API vai retornar nos dados dentro de um array chamado results: []. Se este não existir ou estiver vazio, informamos ao usuario
            if(!dados.results || dados.results.length === 0){
                throw new NotFoundException('Localidade não encontrada')
            }

            //Pegamos o primeiro resultado trazido
            const localizacao = dados.results[0]
            //Reotrnamos de forma visual os dados para que o usuario veja
            return{
                cidade: localizacao.name,
                estado: localizacao.admin1,//representa estado/regiao dentro da api
                pais: localizacao.contry,
                latitude: localizacao.latitude,
                longitude: localizacao.longitude
            }
        } catch(erro){
            if(
                erro instanceof NotFoundException || erro instanceof BadRequestException
            ){
                throw erro
            }
            throw new ServiceUnavailableException("Não foi possivel consultar o serviço de localização")
        }
    }
}