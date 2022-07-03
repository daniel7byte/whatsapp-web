const express = require('express')
const qrcode = require('qrcode-terminal');
const { getRandomInt } = require('./utils/math')
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const app = express()
const port = 3000

app.use(express.json())

// Constants
const { GIRLFRIEND } = require('./utils/constants');

const client = new Client({
  // authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', qr => {
  console.log('QR:', qr);
  qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
  console.log('Client is ready!');

  client.on('message', async message => {
    if (message.body === '!recuerdos') {
      const chat = await message.getChat();
      let randomNumber = getRandomInt(1, 19);
      const media = MessageMedia.fromFilePath(`./recuerdos/${randomNumber}.JPG`);
      chat.sendMessage(media);
      client.sendMessage(message.from, `Yey amor, acabas de encontrar el recuerdo #${randomNumber}... No olvides que TE AMO mi corazón ❤️`);
    }
  });


  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.post('/send_message', async (req, res) => {
    try {
      const { message, phone } = req.body;
      const msg = await client.sendMessage(`${phone}@c.us`, message);
      res.send({ msg })
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  })

  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
});

client.initialize();
