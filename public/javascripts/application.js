(() => {
  const fullTemplate = Handlebars.compile(document.getElementById('full-item').innerText);
  const halfTemplate = Handlebars.compile(document.getElementById('half-item').innerText);
  const fullEmbed = Handlebars.compile(document.getElementById('full-embed').innerText);
  const halfEmbed = Handlebars.compile(document.getElementById('half-embed').innerText);
  const grid = document.getElementById('main-grid');

  const chooseTemplate = function(i, half) {
    console.log(i, half);
    if(!!i.embed && half) return halfEmbed(i)
    if(!!i.embed && !half) return fullEmbed(i)

    if(half) return halfTemplate(i)
    if(!half) return fullTemplate(i)
  }

  const FULL = 1;
  const HALFA = 2;
  const HALFB = 3;
  let nextProcess = FULL;
  function process(arr) {
    return arr.map(r => {
      if(r.data.type === 'rich-link') {
        const reactions = r.reactions.map(r => r.repr).join('');
        const data = r.data.data;
        return {
          imageUrl: data.imageData.url,
          backgroundColor: data.imageData.background_color,
          primaryColor: data.imageData.primary_color,
          secondaryColor: data.imageData.secondary_color,
          detailColor: data.imageData.detail_color,
          title: data.title,
          summary: data.summary,
          emojis: reactions,
        }
      } else if(r.data.type === 'twitter') {
        console.log(r);
        return {
          embed: new Handlebars.SafeString(r.data.data.html)
        }
      } else if(r.data.type === 'vimeo' || r.data.type === 'youtube') {
        const reactions = r.reactions.map(r => r.repr).join('');
        const data = r.data.data;
        return {
          imageUrl: data.thumbnail_data.url,
          backgroundColor: data.thumbnail_data.background_color,
          primaryColor: data.thumbnail_data.primary_color,
          secondaryColor: data.thumbnail_data.secondary_color,
          detailColor: data.thumbnail_data.detail_color,
          title: data.title,
          summary: data.description,
          emojis: reactions,
        }
      }
    })
    .map(data => {
      let result;
      switch (nextProcess) {
        case FULL:
          result = chooseTemplate(data);
          nextProcess = HALFA;
          break;
        case HALFA:
          result = chooseTemplate(data, true);
          nextProcess = HALFB;
          break;
        case HALFB:
          result = chooseTemplate(data, true);
          nextProcess = FULL;
          break;
        default:
          console.warning('????');
      }
      return result
    })
    .join('');
  }

  fetch('/digest')
    .then(r => r.json())
    .then(r => process(r))
    .then(html => grid.insertAdjacentHTML('beforeend', html))
    .catch(console.error);
})()
