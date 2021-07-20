const Discord = require('discord.js');
const axios = require('axios').default;
const fs = require('fs');
const client = new Discord.Client();
const avatar_folder = './avatar/'

const PREFIX = '.'
const ideas = []
const posted_urls = {}
const posted_ids = {}
const seek_id = {}
const subs = {
  'programming': {'channel':'xxx', threshold: 600},
  'interestingasfuck': {'channel':'yyyy', threshold: 25000}
}


const get_random_avatar = () => {
  let avatars = fs.readdirSync(avatar_folder)
  return avatar_folder + avatars[Math.floor(Math.random() * avatars.length)];
}

let can_post = true
let avatar_changed = false
client.once('ready', () => {
  console.log('Ready!');
  setInterval(() => {
    let now = new Date()
    if (can_post && now.getMinutes() === 0) {
      can_post = false
      avatar_changed = false
      console.log(`fetching Reddit post at ${now}`)
      for (const sub_name of Object.keys(subs)) {
        check_reddit(sub_name, subs[sub_name], true)
      }
    } else if (now.getMinutes() === 50) {
      can_post = true
      if (!avatar_changed) {
        avatar_changed = true
        let avatar = get_random_avatar()
        console.log(`setting avatar to ${avatar}`)
        client.user.setAvatar(avatar).catch(err => {console.error(err)})
      }
    }
  }, 45000)
});


client.login('xxxx');

// client.on('message', message => {
//   if (message.channel.name === 'ideas') {
//     if (message.content.startsWith(PREFIX)) {
//       const input = message.content.slice(PREFIX.length)
//       let command = input
//       if (input.indexOf(' ') > -1) {
//         command = input.substr(0, input.indexOf(' '))
//       }
//       if (command === 'add') {
//         ideas.push(input.substr(input.indexOf(' ')+1))
//         message.channel.send('Added!')
//       } else if (command === 'ls') {
//         message.channel.send(build_list_of_ideas(ideas))
//       } else if (command === 'rm') {
//         let index = parseInt(input.substr(input.indexOf(' ')+1))
//         ideas.splice(index, 1)
//         message.channel.send('Deleted!')
//       } else if (command === 'up' || command === 'update') {
//         let content = input.substr(input.indexOf(' ')+1)
//         let index = parseInt(content.substr(0, content.indexOf(' ')))
//         ideas[index] = content.substr(content.indexOf(' ')+1)
//
//       }
//     }
//
//   }
// });


const check_reddit = async (sub_name, {channel, threshold}, send_message) => {
  const response = await axios.get(`https://reddit.com/r/${sub_name}/hot/.json`)
  response.data.data.children.forEach(({data}) => {
    const {score, total_awards_received, permalink, id, url, title} = data
    if (!(id in posted_ids) && !(url in posted_urls)) {
      if (score + 100 * total_awards_received >= threshold) {
        posted_urls[url] = true
        posted_ids[id] = true
        if (send_message) {
          client.channels.cache.get(channel).send(
            `**${title}** \nurl: ${url} \nreddit url: https://reddit.com${permalink}`)
        }
      }
    }
  })
}


// const check_seek = async () => {
//   const response = await axios.get(`https://www.seek.com.au/jobs-in-information-communication-technology/in-All-Hobart-TAS`)
//
//   let $ = cheerio.load(response.data)
//   $("article").each((idx, article) => {
//     let title = $(article).attr("aria-label")
//     let id = $(article).attr("data-job-id")
//   })
// }

const build_list_of_ideas = (ideas) => {
  let result = 'List of ideas:'
  for (let i = 0; i < ideas.length; ++i) {
    result += '\n' + i.toString() + '. ' + ideas[i]
  }
  return result
}


for (const sub_name of Object.keys(subs)) {
  check_reddit(sub_name, subs[sub_name], false)
}

