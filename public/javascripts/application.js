(() => {
  const fullTemplate = Handlebars.compile($('#full-item').html());
  const halfTemplate = Handlebars.compile($('#half-item').html());
  const fullEmbed = Handlebars.compile($('#full-embed').html());
  const halfEmbed = Handlebars.compile($('#half-embed').html());
  const grid = $('#main-grid');
  const users = {}

  const chooseTemplate = function(i, half) {
    console.log(i, half);
    if(!i) { return undefined; }
    if(!!i.embed && half) return halfEmbed(i)
    if(!!i.embed && !half) return fullEmbed(i)

    if(half) return halfTemplate(i)
    if(!half) return fullTemplate(i)
  }

  const halfsQtyForScreen = (() => Math.floor(window.innerWidth / 630))();
  const FULL = 1;
  const HALFS = 2;

  let nextProcess = FULL;
  let halfNumber = 0;
  function process(arr) {
    return arr.map(r => {
      if(r.data.type === 'rich-link') {
        const reactions = r.reactions.map(processReaction).join('');
        const data = r.data.data;
        return {
          imageUrl: data.imageData.url,
          backgroundColor: data.imageData.background_color,
          primaryColor: data.imageData.primary_color,
          secondaryColor: data.imageData.secondary_color,
          detailColor: data.imageData.detail_color,
          title: data.title,
          summary: data.summary,
          emojis: new Handlebars.SafeString(reactions),
          user: r.user,
          perRow: halfsQtyForScreen,
        }
      } else if(r.data.type === 'twitter') {
        console.log(r);
        return {
          embed: new Handlebars.SafeString(r.data.data.html),
          perRow: halfsQtyForScreen,
        }
      } else if(r.data.type === 'vimeo' || r.data.type === 'youtube') {
        const reactions = r.reactions.map(processReaction).join('');
        const data = r.data.data;
        return {
          imageUrl: data.thumbnail_data.url,
          backgroundColor: data.thumbnail_data.background_color,
          primaryColor: data.thumbnail_data.primary_color,
          secondaryColor: data.thumbnail_data.secondary_color,
          detailColor: data.thumbnail_data.detail_color,
          title: data.title,
          summary: data.description,
          emojis: new Handlebars.SafeString(reactions),
          user: r.user,
          perRow: halfsQtyForScreen,
        }
      }
    })
    .map(data => {
      if(!data) {
        return;
      }
      let result;
      switch (nextProcess) {
        case FULL:
          result = chooseTemplate(data);
          nextProcess = HALFS;
          break;
        case HALFS:
          result = chooseTemplate(data, true);
          if(++halfNumber > halfsQtyForScreen - 1) {
            halfNumber = 0;
            nextProcess = FULL;
          }
          break;
        default:
          console.warning('????');
      }
      return result
    })
    .join('');
  }
  $.get('http://beta.digest.d3.do/digest')
    .then(r => process(r))
    .then(html => grid.append(html))
    .catch(console.error);
})()

function processReaction(r) {
  if(r.repr.indexOf('http') === 0) {
    return `<img src="${r.repr}" class="emoji" />`;
  }
  return r.repr;
}
