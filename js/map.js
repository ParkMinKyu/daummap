var isEvent = false;
var overlayOn = false, // 지도 위에 로드뷰 오버레이가 추가된 상태를 가지고 있을 변수
container = document.getElementById('container'), // 지도와 로드뷰를 감싸고 있는 div 입니다
mapWrapper = document.getElementById('mapWrapper'), // 지도를 감싸고 있는 div 입니다
rvContainer = document.getElementById('roadview'), // 로드뷰를 표시할 div 입니다
mapContainer = document.getElementById('map'); // 지도를 담을 영역의 DOM 레퍼런스
var options = { // 지도를 생성할 때 필요한 기본 옵션
	center : new daum.maps.LatLng(37.2662840786853, 127.00024802619322), // 지도의
																			// 중심좌표.
	level : 3
// 지도의 레벨(확대, 축소 정도)
};
var map = new daum.maps.Map(mapContainer, options); // 지도 생성 및 객체 리턴
// 로드뷰 객체를 생성합니다
var rv = new daum.maps.Roadview(rvContainer);
// 좌표로부터 로드뷰 파노라마 ID를 가져올 로드뷰 클라이언트 객체를 생성합니다
var rvClient = new daum.maps.RoadviewClient();
// 로드뷰에 좌표가 바뀌었을 때 발생하는 이벤트를 등록합니다
daum.maps.event.addListener(rv, 'position_changed', function() {
	// 현재 로드뷰의 위치 좌표를 얻어옵니다
	var rvPosition = rv.getPosition();
	// 지도의 중심을 현재 로드뷰의 위치로 설정합니다
	map.setCenter(rvPosition);
	// 지도 위에 로드뷰 도로 오버레이가 추가된 상태이면
	if (overlayOn) {
		// 마커의 위치를 현재 로드뷰의 위치로 설정합니다
		roadMarker.setPosition(rvPosition);
	}
});
// 마커 이미지를 생성합니다
var roadImage = new daum.maps.MarkerImage(
		'http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/roadview_wk.png',
		new daum.maps.Size(35, 39), {
			// 마커의 좌표에 해당하는 이미지의 위치를 설정합니다.
			// 이미지의 모양에 따라 값은 다를 수 있으나, 보통 width/2, height를 주면 좌표에 이미지의 하단 중앙이
			// 올라가게 됩니다.
			offset : new daum.maps.Point(14, 39)
		});
// 드래그가 가능한 마커를 생성합니다
var roadMarker = new daum.maps.Marker({
	image : roadImage,
	position : map.getCenter(),
	draggable : true
});

// 마커에 dragend 이벤트를 등록합니다
daum.maps.event.addListener(roadMarker, 'dragend', function(mouseEvent) {
	// 현재 마커가 놓인 자리의 좌표입니다
	var position = roadMarker.getPosition();
	// 마커가 놓인 위치를 기준으로 로드뷰를 설정합니다
	toggleRoadview(position);
});
// 지도에 클릭 이벤트를 등록합니다
daum.maps.event.addListener(map, 'click', function(mouseEvent) {

	// 지도 위에 로드뷰 도로 오버레이가 추가된 상태가 아니면 클릭이벤트를 무시합니다
	if (!overlayOn) {
		return;
	}
	// 클릭한 위치의 좌표입니다
	var position = mouseEvent.latLng;
	// 마커를 클릭한 위치로 옮깁니다
	roadMarker.setPosition(position);
	// 클락한 위치를 기준으로 로드뷰를 설정합니다
	toggleRoadview(position);
});
// 전달받은 좌표(position)에 가까운 로드뷰의 파노라마 ID를 추출하여
// 로드뷰를 설정하는 함수입니다
function toggleRoadview(position) {
	rvClient.getNearestPanoId(position, 50, function(panoId) {
		// 파노라마 ID가 null 이면 로드뷰를 숨깁니다
		if (panoId === null) {
			toggleMapWrapper(true, position);
		} else {
			toggleMapWrapper(false, position);
			// panoId로 로드뷰를 설정합니다
			rv.setPanoId(panoId, position);
		}
	});
}
// 지도를 감싸고 있는 div의 크기를 조정하는 함수입니다
function toggleMapWrapper(active, position) {
	if (active) {
		// 지도를 감싸고 있는 div의 너비가 100%가 되도록 class를 변경합니다
		container.className = '';
		// 지도의 크기가 변경되었기 때문에 relayout 함수를 호출합니다
		map.relayout();
		// 지도의 너비가 변경될 때 지도중심을 입력받은 위치(position)로 설정합니다
		map.setCenter(position);
	} else {
		// 지도만 보여지고 있는 상태이면 지도의 너비가 50%가 되도록 class를 변경하여
		// 로드뷰가 함께 표시되게 합니다
		if (container.className.indexOf('view_roadview') === -1) {
			container.className = 'view_roadview';
			// 지도의 크기가 변경되었기 때문에 relayout 함수를 호출합니다
			map.relayout();
			// 지도의 너비가 변경될 때 지도중심을 입력받은 위치(position)로 설정합니다
			map.setCenter(position);
		}
	}
}
// 지도 위의 로드뷰 도로 오버레이를 추가,제거하는 함수입니다
function toggleOverlay(active) {
	if (active) {
		overlayOn = true;
		// 지도 위에 로드뷰 도로 오버레이를 추가합니다
		map.addOverlayMapTypeId(daum.maps.MapTypeId.ROADVIEW);
		// 지도 위에 마커를 표시합니다
		roadMarker.setMap(map);
		// 마커의 위치를 지도 중심으로 설정합니다
		roadMarker.setPosition(map.getCenter());
		// 로드뷰의 위치를 지도 중심으로 설정합니다
		toggleRoadview(map.getCenter());
	} else {
		overlayOn = false;
		// 지도 위의 로드뷰 도로 오버레이를 제거합니다
		map.removeOverlayMapTypeId(daum.maps.MapTypeId.ROADVIEW);
		// 지도 위의 마커를 제거합니다
		roadMarker.setMap(null);
	}
}
// 지도 위의 로드뷰 버튼을 눌렀을 때 호출되는 함수입니다
function setRoadviewRoad() {
	var control = document.getElementById('roadviewControl');
	// 버튼이 눌린 상태가 아니면
	if (control.className.indexOf('active') === -1) {
		control.className = 'active';
		// 로드뷰 도로 오버레이가 보이게 합니다
		toggleOverlay(true);
	} else {
		control.className = '';
		// 로드뷰 도로 오버레이를 제거합니다
		toggleOverlay(false);
	}
}
// 로드뷰에서 X버튼을 눌렀을 때 로드뷰를 지도 뒤로 숨기는 함수입니다
function closeRoadview() {
	var position = roadMarker.getPosition();
	toggleMapWrapper(true, position);
}
// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new daum.maps.MapTypeControl();
// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
// daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
// 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성합니다
var zoomControl = new daum.maps.ZoomControl();
map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
function getLngLat() {
	var geocoder = new daum.maps.services.Geocoder();
	var addr = document.getElementById('addr');
	// 주소로 좌표를 검색합니다
	geocoder.addr2coord(addr.value, function(status, result) {
		// 정상적으로 검색이 완료됐으면
		if (status === daum.maps.services.Status.OK) {
			var coords = new daum.maps.LatLng(result.addr[0].lat,
					result.addr[0].lng);
			// 결과값으로 받은 위치를 마커로 표시합니다
			var marker = new daum.maps.Marker({
				map : map,
				position : coords
			});
			// 인포윈도우로 장소에 대한 설명을 표시합니다
			var infowindow = new daum.maps.InfoWindow({
				content : '<div style="padding:5px;">우리회사</div>'
			});
			infowindow.open(map, marker);
		}
	});
}

/*--------------------------------------------*/
var drawingFlag = false; // 원이 그려지고 있는 상태를 가지고 있을 변수입니다
var centerPosition; // 원의 중심좌표 입니다
var drawingCircle; // 그려지고 있는 원을 표시할 원 객체입니다
var drawingLine; // 그려지고 있는 원의 반지름을 표시할 선 객체입니다
var drawingOverlay; // 그려지고 있는 원의 반경을 표시할 커스텀오버레이 입니다
var drawingDot; // 그려지고 있는 원의 중심점을 표시할 커스텀오버레이 입니다
var circles = []; // 클릭으로 그려진 원과 반경 정보를 표시하는 선과 커스텀오버레이를 가지고 있을 배열입니다
// 지도에 클릭 이벤트를 등록합니다
daum.maps.event.addListener(map, 'click', function(mouseEvent) {

	// 클릭 이벤트가 발생했을 때 원을 그리고 있는 상태가 아니면 중심좌표를 클릭한 지점으로 설정합니다
	if (!drawingFlag) {

		// 상태를 그리고있는 상태로 변경합니다
		drawingFlag = true;

		// 원이 그려질 중심좌표를 클릭한 위치로 설정합니다
		centerPosition = mouseEvent.latLng;
		// 그려지고 있는 원의 반경을 표시할 선 객체를 생성합니다
		if (!drawingLine) {
			drawingLine = new daum.maps.Polyline({
				strokeWeight : 3, // 선의 두께입니다
				strokeColor : '#00a0e9', // 선의 색깔입니다
				strokeOpacity : 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
				strokeStyle : 'solid' // 선의 스타일입니다
			});
		}

		// 그려지고 있는 원을 표시할 원 객체를 생성합니다
		if (!drawingCircle) {
			drawingCircle = new daum.maps.Circle({
				strokeWeight : 1, // 선의 두께입니다
				strokeColor : '#00a0e9', // 선의 색깔입니다
				strokeOpacity : 0.1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
				strokeStyle : 'solid', // 선의 스타일입니다
				fillColor : '#00a0e9', // 채우기 색깔입니다
				fillOpacity : 0.2
			// 채우기 불투명도입니다
			});
		}

		// 그려지고 있는 원의 반경 정보를 표시할 커스텀오버레이를 생성합니다
		if (!drawingOverlay) {
			drawingOverlay = new daum.maps.CustomOverlay({
				xAnchor : 0,
				yAnchor : 0,
				zIndex : 1
			});
		}
	}
});
// 지도에 마우스무브 이벤트를 등록합니다
// 원을 그리고있는 상태에서 마우스무브 이벤트가 발생하면 그려질 원의 위치와 반경정보를 동적으로 보여주도록 합니다
daum.maps.event
		.addListener(
				map,
				'mousemove',
				function(mouseEvent) {

					// 마우스무브 이벤트가 발생했을 때 원을 그리고있는 상태이면
					if (drawingFlag) {
						// 마우스 커서의 현재 위치를 얻어옵니다
						var mousePosition = mouseEvent.latLng;

						// 그려지고 있는 선을 표시할 좌표 배열입니다. 클릭한 중심좌표와 마우스커서의 위치로 설정합니다
						var linePath = [ centerPosition, mousePosition ];

						// 그려지고 있는 선을 표시할 선 객체에 좌표 배열을 설정합니다
						drawingLine.setPath(linePath);

						// 원의 반지름을 선 객체를 이용해서 얻어옵니다
						var length = drawingLine.getLength();

						if (length > 0) {

							// 그려지고 있는 원의 중심좌표와 반지름입니다
							var circleOptions = {
								center : centerPosition,
								radius : length,
							};

							// 그려지고 있는 원의 옵션을 설정합니다
							drawingCircle.setOptions(circleOptions);

							// 반경 정보를 표시할 커스텀오버레이의 내용입니다
							var radius = Math.round(drawingCircle.getRadius()), content = '<div class="info">반경 <span class="number">'
									+ radius + '</span>m</div>';

							// 반경 정보를 표시할 커스텀 오버레이의 좌표를 마우스커서 위치로 설정합니다
							drawingOverlay.setPosition(mousePosition);

							// 반경 정보를 표시할 커스텀 오버레이의 표시할 내용을 설정합니다
							drawingOverlay.setContent(content);

							// 그려지고 있는 원을 지도에 표시합니다
							drawingCircle.setMap(map);

							// 그려지고 있는 선을 지도에 표시합니다
							drawingLine.setMap(map);

							// 그려지고 있는 원의 반경정보 커스텀 오버레이를 지도에 표시합니다
							drawingOverlay.setMap(map);

						} else {

							drawingCircle.setMap(null);
							drawingLine.setMap(null);
							drawingOverlay.setMap(null);

						}
					}
				});
// 지도에 마우스 오른쪽 클릭이벤트를 등록합니다
// 원을 그리고있는 상태에서 마우스 오른쪽 클릭 이벤트가 발생하면
// 마우스 오른쪽 클릭한 위치를 기준으로 원과 원의 반경정보를 표시하는 선과 커스텀 오버레이를 표시하고 그리기를 종료합니다
daum.maps.event.addListener(map, 'rightclick', function(mouseEvent) {
	if (drawingFlag) {
		// 마우스로 오른쪽 클릭한 위치입니다
		var rClickPosition = mouseEvent.latLng;
		// 원의 반경을 표시할 선 객체를 생성합니다
		var polyline = new daum.maps.Polyline({
			path : [ centerPosition, rClickPosition ], // 선을 구성하는 좌표 배열입니다. 원의
														// 중심좌표와 클릭한 위치로 설정합니다
			strokeWeight : 3, // 선의 두께 입니다
			strokeColor : '#00a0e9', // 선의 색깔입니다
			strokeOpacity : 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
			strokeStyle : 'solid' // 선의 스타일입니다
		});

		// 원 객체를 생성합니다
		var circle = new daum.maps.Circle({
			center : centerPosition, // 원의 중심좌표입니다
			radius : polyline.getLength(), // 원의 반지름입니다 m 단위 이며 선 객체를 이용해서
											// 얻어옵니다
			strokeWeight : 1, // 선의 두께입니다
			strokeColor : '#00a0e9', // 선의 색깔입니다
			strokeOpacity : 0.1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
			strokeStyle : 'solid', // 선의 스타일입니다
			fillColor : '#00a0e9', // 채우기 색깔입니다
			fillOpacity : 0.2
		// 채우기 불투명도입니다
		});

		var radius = Math.round(circle.getRadius()), // 원의 반경 정보를 얻어옵니다
		content = getTimeHTML(radius); // 커스텀 오버레이에 표시할 반경 정보입니다

		// 반경정보를 표시할 커스텀 오버레이를 생성합니다
		var radiusOverlay = new daum.maps.CustomOverlay({
			content : content, // 표시할 내용입니다
			position : rClickPosition, // 표시할 위치입니다. 클릭한 위치로 설정합니다
			xAnchor : 0,
			yAnchor : 0,
			zIndex : 1
		});
		// 원을 지도에 표시합니다
		circle.setMap(map);

		// 선을 지도에 표시합니다
		polyline.setMap(map);

		// 반경 정보 커스텀 오버레이를 지도에 표시합니다
		radiusOverlay.setMap(map);

		// 배열에 담을 객체입니다. 원, 선, 커스텀오버레이 객체를 가지고 있습니다
		var radiusObj = {
			'polyline' : polyline,
			'circle' : circle,
			'overlay' : radiusOverlay
		};

		// 배열에 추가합니다
		// 이 배열을 이용해서 "모두 지우기" 버튼을 클릭했을 때 지도에 그려진 원, 선, 커스텀오버레이들을 지웁니다
		circles.push(radiusObj);

		// 그리기 상태를 그리고 있지 않는 상태로 바꿉니다
		drawingFlag = false;

		// 중심 좌표를 초기화 합니다
		centerPosition = null;

		// 그려지고 있는 원, 선, 커스텀오버레이를 지도에서 제거합니다
		drawingCircle.setMap(null);
		drawingLine.setMap(null);
		drawingOverlay.setMap(null);
	}
});

// 지도에 표시되어 있는 모든 원과 반경정보를 표시하는 선, 커스텀 오버레이를 지도에서 제거합니다
function removeCircles() {
	for (var i = 0; i < circles.length; i++) {
		circles[i].circle.setMap(null);
		circles[i].polyline.setMap(null);
		circles[i].overlay.setMap(null);
	}
	circles = [];
}
// 마우스 우클릭 하여 원 그리기가 종료됐을 때 호출하여
// 그려진 원의 반경 정보와 반경에 대한 도보, 자전거 시간을 계산하여
// HTML Content를 만들어 리턴하는 함수입니다
function getTimeHTML(distance) {
	// 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
	var walkkTime = distance / 67 | 0;
	var walkHour = '', walkMin = '';
	// 계산한 도보 시간이 60분 보다 크면 시간으로 표시합니다
	if (walkkTime > 60) {
		walkHour = '<span class="number">' + Math.floor(walkkTime / 60)
				+ '</span>시간 '
	}
	walkMin = '<span class="number">' + walkkTime % 60 + '</span>분'
	// 자전거의 평균 시속은 16km/h 이고 이것을 기준으로 자전거의 분속은 267m/min입니다
	var bycicleTime = distance / 227 | 0;
	var bycicleHour = '', bycicleMin = '';
	// 계산한 자전거 시간이 60분 보다 크면 시간으로 표출합니다
	if (bycicleTime > 60) {
		bycicleHour = '<span class="number">' + Math.floor(bycicleTime / 60)
				+ '</span>시간 '
	}
	bycicleMin = '<span class="number">' + bycicleTime % 60 + '</span>분'
	// 거리와 도보 시간, 자전거 시간을 가지고 HTML Content를 만들어 리턴합니다
	var content = '<ul class="info">';
	content += '    <li>';
	content += '        <span class="label">총거리</span><span class="number">'
			+ distance + '</span>m';
	content += '    </li>';
	content += '    <li>';
	content += '        <span class="label">도보</span>' + walkHour + walkMin;
	content += '    </li>';
	content += '    <li>';
	content += '        <span class="label">자전거</span>' + bycicleHour
			+ bycicleMin;
	content += '    </li>';
	content += '</ul>'
	return content;
}

// 지도에 표시된 마커 객체를 가지고 있을 배열입니다
var markers = new Array();

function showAll(){
	hideMarkers();
	var code = mapInfoList[mapCodeGroup.index];
	var mapList = code.mapList;	               
	if(markers[mapCodeGroup.index] == null )markers[mapCodeGroup.index] = new Array();
	for(var i = 0 ; i < mapList.length ; i ++){
		if(markers[mapCodeGroup.index][i] == null){
			var mapInfo = mapList[i];
			var imageSrc = '/daummap'+code.imgpath, // 마커이미지의 주소입니다
			imageSize = new daum.maps.Size(40, 40), // 마커이미지의 크기입니다
			imageOption = {
				offset : new daum.maps.Point(10, 40)
			}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
			// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
			var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize,
					imageOption), markerPosition = new daum.maps.LatLng(mapInfo.lat, mapInfo.lng); // 마커가
																					// 표시될
																					// 위치입니다
			// 마커를 생성합니다
			var marker = new daum.maps.Marker({
				position : markerPosition,
				image : markerImage
			// 마커이미지 설정
			});
			// 마커가 지도 위에 표시되도록 설정합니다
			marker.setMap(map);
			markers[mapCodeGroup.index][i] = marker;
			markers[mapCodeGroup.index][i].infowindow.open(map, markers[mapCodeGroup.index][i]);
		}else if(markers[mapCodeGroup.index][i].mf == null){
			markers[mapCodeGroup.index][i].infowindow.open(map, markers[mapCodeGroup.index][i]);
			markers[mapCodeGroup.index][i].setMap(map);
		}
	}
}

function crateMarker( lat, lng, imgpath) {
	if(markers[mapCodeGroup.index] == null )markers[mapCodeGroup.index] = new Array();
	if(markers[mapCodeGroup.index][codeMapList.index] == null){
		var imageSrc = '/daummap'+imgpath, // 마커이미지의 주소입니다
		imageSize = new daum.maps.Size(40, 40), // 마커이미지의 크기입니다
		imageOption = {
			offset : new daum.maps.Point(10, 40)
		}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
		// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
		var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize,
				imageOption), markerPosition = new daum.maps.LatLng(lat, lng); // 마커가
																				// 표시될
																				// 위치입니다
		// 마커를 생성합니다
		var marker = new daum.maps.Marker({
			position : markerPosition,
			image : markerImage
		// 마커이미지 설정
		});
		// 마커가 지도 위에 표시되도록 설정합니다
		marker.setMap(map);
		markers[mapCodeGroup.index][codeMapList.index] = marker;
		markers[mapCodeGroup.index][codeMapList.index].infowindow.open(map, markers[mapCodeGroup.index][codeMapList.index]);
	}else if(markers[mapCodeGroup.index][codeMapList.index].mf == null){
		markers[mapCodeGroup.index][codeMapList.index].infowindow.open(map, markers[mapCodeGroup.index][codeMapList.index]);
		markers[mapCodeGroup.index][codeMapList.index].setMap(map);
	}else{
		markers[mapCodeGroup.index][codeMapList.index].setMap(null)
		markers[mapCodeGroup.index][codeMapList.index].infowindow.close();
	}
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
			if(markers[i] == null )markers[i] = new Array();
		    for (var j = 0; j < markers[i].length; j++) {
				if(markers[i][j] != null)
		        markers[i][j].setMap(map);
		        if(map == null && markers[i][j].infowindow != null){
		        	markers[i][j].infowindow.close();
		        }
			}
    }            
}

// "마커 보이기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에 표시하는 함수입니다
function showMarkers() {
   hideMarkers();
   for(var i = 0 ; i < mapInfoList.length ; i ++){
	   var code = mapInfoList[i];
	   var mapList = code.mapList;	               
	   	if(markers[i] == null )markers[i] = new Array();
		for(var j = 0 ; j < mapList.length ; j ++){
			if(markers[i][j] == null){
				var mapInfo = mapList[j];
				var imageSrc = '/daummap'+code.imgpath, // 마커이미지의 주소입니다
				imageSize = new daum.maps.Size(40, 40), // 마커이미지의 크기입니다
				imageOption = {
					offset : new daum.maps.Point(10, 40)
				}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
				// 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
				var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize,
						imageOption), markerPosition = new daum.maps.LatLng(mapInfo.lat, mapInfo.lng); // 마커가
																						// 표시될
																						// 위치입니다
				// 마커를 생성합니다
				var marker = new daum.maps.Marker({
					position : markerPosition,
					image : markerImage
				// 마커이미지 설정
				});
				// 마커가 지도 위에 표시되도록 설정합니다
				marker.setMap(map);
				markers[i][j] = marker;
			}else if(markers[i][j].mf == null){
				markers[i][j].setMap(map);
				markers[i][j].infowindow.open(map, markers[i][j]);
			}
		}
   }
   if(!isEvent){
   	addMarkerEvent();	
   	isEvent = true;
   }
}

function addMarkerEvent(){
	for (var i = 0; i < markers.length; i++) {
		if(markers[i] == null )markers[i] = new Array();
		    for (var j = 0; j < markers[i].length; j++) {
				if(markers[i][j] != null ){
					markers[i][j].codeIdx = i;
					markers[i][j].mapIdx = j;
					if(markers[i][j].infowindow == null){
						var codeInfo = mapInfoList[i];
						var mapInfo = codeInfo.mapList[j];
						// 마커 위에 표시할 인포윈도우를 생성한다
						var infowindow = new daum.maps.InfoWindow({
						    content : '<div style="padding:5px;">'+mapInfo.name+'</div>' // 인포윈도우에 표시할 내용
						});
						markers[i][j].infowindow = infowindow;
					}
					markers[i][j].infowindow.open(map, markers[i][j]);
					
					// 마커에 클릭이벤트를 등록합니다
					daum.maps.event.addListener(markers[i][j], 'click', function() {
						  // 마커 위에 인포윈도우를 표시합니다
						 console.log(this.codeIdx);
						 console.log(this.mapIdx);
						 var codeInfo = mapInfoList[this.codeIdx];
						 var mapInfo = codeInfo.mapList[this.mapIdx];
						  $('#mapName').text(mapInfo.name);
							$('#mapAddr').text(mapInfo.addr);
							$('#mapPhon').text(mapInfo.phon);
							$('#cctvList').html('');
							var cctvList = mapInfo.cctvList;
							if (cctvList.length > 0) {
							var html = '<div id="siteWpr">';
							html += '<div class="simpleBanner">';
							html += '<div class="bannerListWpr">';
							html += '<ul class="bannerList">';
							for (var i = 0; i < cctvList.length; i++) {
								var cctv = cctvList[i];
								html += '<li><img src="/daummap' + cctv.imgpath + '" ></li>';
							}
							html += '</ul>';
							html += '</div>';
							html += '<div class="bannerControlsWpr bannerControlsPrev"><div class="bannerControls"></div></div>';
							html += '<div class="bannerIndicators"><ul></ul></div>';
							html += '<div class="bannerControlsWpr bannerControlsNext"><div class="bannerControls"></div></div>';
							html += '</div>';
							html += '</div>';
							$('#cctvList').html(html);
							$('.simpleBanner').simplebanner({
								autoRotate : false
							});
							$('#mapCctv').text("");
							$('#cctvList').show();
							} else {
							$('#mapCctv').text("CCTV 정보 없음.");
							$('#cctvList').hide();
							}
							mapInfoWindow.show();
					});
				}
			}
    }    
}

// "마커 감추기" 버튼을 클릭하면 호출되어 배열에 추가된 마커를 지도에서 삭제하는 함수입니다
function hideMarkers() {
	removeCircles();
    setMarkers(null);    
}

function panTo(lat, lng) {
    // 이동할 위도 경도 위치를 생성합니다 
    var moveLatLon = new daum.maps.LatLng(lat, lng);
    
    // 지도 중심을 부드럽게 이동시킵니다
    // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
    map.panTo(moveLatLon);            
}
