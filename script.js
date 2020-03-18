const HEAT_COLOR = {
  low: "#ffdcdc",
  medium: "#fb8d8d",
  high: "#b61b1b"
};

document.getElementById("svg2").addEventListener("load", function() {
  loadApp();
});

function fetch(theUrl) {
  return new Promise(function(resolver) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        resolver(JSON.parse(xmlHttp.responseText));
      }
    };
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
  });
}

function loadApp(event) {
  Promise.all([
    fetch("https://covid19.mathdro.id/api/countries/brazil"),
  ]).then(function(resolver) {
    updateDashBoard(resolver);
  }).catch(function (error) {
    console.warn(error);
  });
  updateMap();
}

function updateDashBoard(data) {
  console.log(data)
  const confirmed = document.getElementById("confirmed");
  const recovered = document.getElementById("recovere");
  const dead = document.getElementById("dead");
  const lastupdate = document.getElementById("lastupdate");

  confirmed.innerText = data[0].confirmed.value;
  recovered.innerText = data[0].recovered.value;
  dead.innerText = data[0].deaths.value;
  lastupdate.innerText = formatDate(data[0].lastUpdate);
}

function updateMap() {
  // ainda não hospedado na nuvem interna
  const jsonUrl = "https://api.myjson.com/bins/d49iu";
  fetch(jsonUrl).then(function(resolver) {
    const ufs = resolver.UF;
    const svg = document.querySelector("svg");
    svg.onmouseleave = hideTooltip();
    // não tem uma lógica ainda para o calor
    // esperar implementar api por estado dinamico
    // fiz com base nos casos menores
    ufs.map(function(estado) {
      if (estado.total > 0 && estado.total <= 10) {
        svg.getElementById(estado.path).style.fill = HEAT_COLOR.low;
      } else if (estado.total > 0 && estado.total <= 50) {
        svg.getElementById(estado.path).style.fill = HEAT_COLOR.medium;
      } else if (estado.total > 0 && estado.total > 50) {
        svg.getElementById(estado.path).style.fill = HEAT_COLOR.high;
      }
      svg.getElementById(estado.path).onmousemove = function(e) {
        showTooltip(e, estado);
      };
      return estado;
    });
  });
}

function formatNumberMinorZero(num) {
  if (num < 10) {
    num = "0" + num;
  }
  return num;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dt = formatNumberMinorZero(date.getDate());
  const hour = formatNumberMinorZero(date.getHours());
  const min = formatNumberMinorZero(date.getMinutes());

  return `${dt}/${month}/${year} ${hour}:${min}`;
}

function showTooltip(e, estado) {
  let tooltip = getToolTip();
  tooltip.innerHTML = `<h5>${
    estado.total
  }<small style="color: white !important">Total Casos ${
    estado.nome
  }</small></h5>`;
  tooltip.style.display = "block";
  tooltip.style.left = e.pageX + 10 + "px";
  tooltip.style.top = e.pageY + 10 + "px";
}

function hideTooltip() {
  var tooltip = getToolTip();
  tooltip.style.display = "none";
}

function getToolTip() {
  return document.querySelector(".tooltipSVG");
}
