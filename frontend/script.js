//Configuração inicial do mapa
//Deinimos aqui um lugar para a posição inicial do mapa (neste caso, no Brasil)
const mapa = L.map('mapa').setView([-14.235, -51.9253], 4)//criando uma localização pra quando abrir a nossa pagina ele esta na localização definida

//Responsavel por adicionar as imagens
L.tileLayer/*recurso da biblioteca, ele pega as mini imagens*/('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; OpenStreet contributors'
}).addTo(mapa)

//Este será nosso marcador atual, ele quem vai permitir que agente remova o marcador antigo
let marcador;

//Elementos do HTML
const inputCep = document.getElementById("cep")
const btnBuscar = document.getElementById("btnBuscar")
const btnLocalizacao = document.getElementById("btnLocalizacao")
const mensagem = document.getElementById("mensagem")


//Função resposavel por preencher as informações sober o cep, na tela do usuario
function preencherInformacoes(dados){
    document.getElementById('resultadoCep').textContent = dados.cep || '-'
    document.getElementById('logradouro').textContent = dados.logradouro || '-'
    document.getElementById('bairro').textContent = dados.bairro || '-'
    document.getElementById('cidade').textContent = dados.cidade || '-'
    document.getElementById('estado').textContent = dados.estado || '-'
    document.getElementById('latitude').textContent = dados.latitude || '-'
    document.getElementById('longitude').textContent = dados.longitude || '-'
}   
//função responsavel por atualizar nosso mapa com as novas coordenadas
function atualizarMapa(latitude, longitude, textoMarcador){
    //Centraliza o mapa na localização informada
    mapa.setView([latitude, longitude], 15)
    //Se já existir um marcador, removemos antes de criar um novo
    if(marcador){
        mapa.removeLayer(marcador)
    }

    //Cria um novo marcador (vermelho no mapa)
    marcador = L.marker([latitude, longitude])
    .addTo(mapa)
    .bindPopup(textoMarcador)
    .openPopup()
}

//ver se tem valor no input
btnBuscar.addEventListener('click', async ()=>{
    const cep = inputCep.value.trim()
    mensagem.textContent = ''
    if(!cep){
        mensagem.textContent = 'Informe um cep'
        return
    }
    try{
        //O nosso frontend não consulta diretamente a viaCep, ela consulta a nossa API
        const resposta = await fetch(`http://localhost:3000/localizacao/cep/${cep}/coordenadas`)

        //Convertemos a resposta para JSON
        const dados = await resposta.json()
        //Se a API retornar erro HTTP, por exemplo 400 ou 404
        if(!resposta.ok){
            throw new Error(dados.message || 'Não foi possivel realizar a consulta')
        }
        //Mostrara os dados na tela
        preencherInformacoes(dados)
        //Atuliza nosso mapa
        atualizarMapa(
            dados.latitude,
            dados.longitude,
            `${dados.logradouro} - ${dados.cidade}`
        )
    } catch(erro){
        mensagem.textContent = erro.message
    }
})

//LOCALIZAÇÃO ATUAL
btnLocalizacao.addEventListener("click", () =>{
    mensagem.textContent = '';
    //Verificamos de o navegador possui suporte a geocalização
    if(!navigator.geolocation){
        mensagem.textContent = 'Seu navegador não possui suporte de geocalização'
    }
    //Caso tenha suporte, podemos prosseguir solicitando a localização atual
    navigator.geolocation.getCurrentPosition(
        (posicao)=>{
            //Pegamos as informações atraves do navegador
            const latitude = posicao.coords.latitude
            const longitude = posicao.coords.longitude
            //Mostramos as cordenadas na tela
            document.getElementById('latitude').textContent = latitude
            document.getElementById('longitude').textContent = longitude
            //Apartir daqui, como não precisamos do CEP. limpamos os campos do enfereço
            document.getElementById('resultadoCep').textContent = '-'
            document.getElementById('logradouro').textContent = '-'
            document.getElementById('bairro').textContent = '-'
            document.getElementById('cidade').textContent = '-'
            document.getElementById('estado').textContent = '-'
            //Atualizamos o mapa
            atualizarMapa(latitude, longitude, 'Minha localização')
        },
        (erro)=>{
            if(erro.code === 1){
                mensagem.textContent = 'Permissão de localização negada'
            }else{
                mensagem.textContent = 'Não foi possivel obter sua localização'
            }
        }
    )
    
})

