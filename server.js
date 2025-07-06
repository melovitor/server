const http = require('http');
const https = require('https');

// Configurações
const PORT = process.env.PORT || 3000;
const NETSUITE_URL = 'https://11261030.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=3805&deploy=1&compid=11261030&ns-at=AAEJ7tMQ_fFIchTkxiH7rT_vYeV6lMKUQ2Gv3_l0PeIiMd-ZiVw';

// Função para enviar os dados ao NetSuite
function sendToNetSuite(data) {
  const jsonData = JSON.stringify(data);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0',
    }
  };

  const req = https.request(NETSUITE_URL, options, (res) => {
    let response = '';
    res.on('data', chunk => response += chunk);
    res.on('end', () => {
      console.log(`✅ Resposta do NetSuite: ${response}`);
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erro ao enviar para o NetSuite:', e.message);
  });

  req.write(jsonData);
  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/wms-to-ns') {
    let body = '';

    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('📦 Dados recebidos do WMS:', data);

        // Envia resposta imediata ao WMS
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sucesso: true, mensagem: 'Dados recebidos com sucesso.' }));

        // Continua o processamento em segundo plano
        sendToNetSuite(data);

      } catch (e) {
        console.error('❌ JSON inválido:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sucesso: false, erro: 'JSON inválido' }));
      }
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Rota não encontrada' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
