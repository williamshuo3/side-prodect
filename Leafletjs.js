 const Taipei =axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City/Taipei?%24top=3000&%24count=true&%24format=JSON`) 
 const Yilan =axios.get(`https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City/YilanCounty?%24top=30&%24format=JSON`) 
 const choose = document.querySelector('.choose');
 const car = document.querySelector('#sort-list');
 const crop = document.querySelector('#crop');
 const btn = document.querySelector('.search2');
 const box = document.querySelector('.box');
 let data = [];//取出來的預設資料
 const map = L.map("myMap", {
          center: [25.04776, 121.53185],// 設定地圖中心點與放大級別
          zoom: 17
        });

//抓取資料
Promise.all([Taipei,Yilan])
.then(axios.spread((res1, res2) => {
  data = [...res1.data.CarParks,...res2.data.CarParks]
  console.log(data)
       search(data)
       EnterSearch(data)
       myMap(data)
  }
))
// 抓取資料
// function getData(){
//  axios.get(CarPark)
//    .then(res => {
//       data = res.data.CarParks;
//        search(data)
//        EnterSearch(data)
//        myMap(data)
//    })
//    .catch(error=>
//     console.log(error)
//   )
// }
 
function EnterSearch(data){
  box.addEventListener('click',(e)=>{
    function cropSearch(){
      let carData = [];
      let text = '';
      carData = data.filter(item => item.CarParkName.Zh_tw === crop.value.trim());
      carData.forEach(item => text += `<div class="sort-title"><a href="#">${item.CarParkName.Zh_tw}</a></div>
      <div class="sort-info"><i class="bi bi-p-circle" style="margin-right: 5px;"></i>${item.Description}</div>
      <div class="sort-info"><i class="bi bi-credit-card" style="margin-right: 5px;"></i>${item.FareDescription}</div>`);
      car.innerHTML = text;
      crop.value = '';
                  // 為每個停車場名稱元素添加點擊事件
                document.querySelectorAll('.sort-title a').forEach((element ,index) => {
                  let title = data[index].CarParkName.Zh_tw;
                  let content = data[index].FareDescription;
                  element.addEventListener('click', () => {
                  const lat = data[index].CarParkPosition.PositionLat;
                  const lon = data[index].CarParkPosition.PositionLon;

                    map.panTo([lat, lon]); // 移動地圖中心到該位置
                    map.openPopup(`<h2 style="font-size: 18px; font-weight:700; text-align:center;">${title}</h2>
                                  <br/><p style="margin: 0;">${content}</p>`, [lat, lon]);
                  });
            });
    }
    if(e.target.nodeName==="BUTTON"){ crop.value.trim() === "" || crop.value.trim() === data ? alert('請輸入正確停車場名稱')  : cropSearch()}
    
  })
}
 //透過下拉選單去篩選停車場
 function search (data){
  choose.addEventListener('change',item =>{
  let filterData=[];
  let str = '';
  filterData = item.target.value === '0' ? data :
                 item.target.value === '地下停車場' ? data.filter(index => index.CarParkName.Zh_tw.includes('地下停車場')) :
                 item.target.value === '立體停車場' ? data.filter(index => index.CarParkName.Zh_tw.includes('立體停車場')) :
                 item.target.value === '停車場' ? data.filter(index => index.City.includes('YilanCounty')) :
                 [];

      filterData.forEach(item => { str += `
      <div class="sort-title"><a href="#" data-lat="${item.CarParkPosition.PositionLat}" data-lon="${item.CarParkPosition.PositionLon}" data-title="${item.CarParkName.Zh_tw}"
       data-content="${item.FareDescription}">
       ${item.CarParkName.Zh_tw}</a></div>
       ${item.FareDescription !== '未知' ?
      `<div class="sort-info"><i class="bi bi-p-circle" style="margin-right: 5px;"></i>${item.Description}</div>
      <div class="sort-info"><i class="bi bi-credit-card" style="margin-right: 5px;"></i>${item.FareDescription}</div>` :
      `<div class="sort-info">尚在調查</div>`}` 
    });
      car.innerHTML = str;


        document.querySelectorAll('.sort-title a').forEach((element) => {
          
          element.addEventListener('click', (event) => {
            if(event.target.tagName === 'A') {
              let title = event.target.dataset.title;
              let content = event.target.dataset.content;
            const lat = parseFloat(event.target.dataset.lat);
            const lon = parseFloat(event.target.dataset.lon);
              map.panTo([lat, lon]);// 移動地圖中心到該位置
              map.openPopup(`<h2 style="font-size: 18px; font-weight:700; text-align:center;">${title}</h2>
              <br/><p style="margin: 0;">${content}</p>`, [lat, lon])
            }
          });
      });
  });
 }


 function myMap(showData){

// 載入圖資
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'
}).addTo(map);

let redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',iconSize: [25, 41],shadowSize: [41, 41]
  });
let blueIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',iconSize: [25, 41],shadowSize: [41, 41]
  });
let markers = L.markerClusterGroup().addTo(map);//創建座標群

showData.forEach(item => {
  let icon
  item.CarParkName.Zh_tw .includes('地下停車場')? icon = redIcon :icon = blueIcon ;

const lat = parseFloat(item.CarParkPosition.PositionLat); // 將字串轉換為浮點數
const lon = parseFloat(item.CarParkPosition.PositionLon); // 將字串轉換為浮點數
let marker = L.marker([lat,lon],{icon:icon}); // 底層 Marker
let title = item.CarParkName.Zh_tw;
let content = item.FareDescription
marker.bindPopup(`<h2 style="font-size: 18px; font-weight:700; text-align:center;">${title}</h2>
<br/><p style="margin: 0;">${content}</p>`);
// 資訊視窗
markers.openPopup();
markers.addLayer(marker); // 把 marker 加入 L.markerClusterGroup
});

}

// 地圖的生成
// function myMap(showData){

//         // 載入圖資
//         L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//           attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'
//         }).addTo(map);

//         let redIcon = new L.Icon({
//             iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',iconSize: [25, 41],shadowSize: [41, 41]
//           });
//         let blueIcon = new L.Icon({
//               iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',iconSize: [25, 41],shadowSize: [41, 41]
//           });
//         let markers = L.markerClusterGroup().addTo(map);//創建座標群

//         showData.forEach(item => {
//           console.log(item)
//           let icon
//           item.CarParkName.Zh_tw .includes('地下停車場')? icon = redIcon :icon = blueIcon ;
        
//         const lat = parseFloat(item.CarParkPosition.PositionLat); // 將字串轉換為浮點數
//         const lon = parseFloat(item.CarParkPosition.PositionLon); // 將字串轉換為浮點數
//         let marker = L.marker([lat,lon],{icon:icon}); // 底層 Marker
//         let title = item.CarParkName.Zh_tw;
//         let content = item.FareDescription
//         marker.bindPopup(`<h2 style="font-size: 18px; font-weight:700; text-align:center;">${title}</h2>
//         <br/><p style="margin: 0;">${content}</p>`);
//    // 資訊視窗
//         markers.openPopup();
//         markers.addLayer(marker); // 把 marker 加入 L.markerClusterGroup
//     });

// }