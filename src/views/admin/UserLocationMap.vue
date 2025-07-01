<template>
  <div class="user-location-map">
    <h2>사용자 위치 지도</h2>
    <p class="map-description">
      사용자들의 위치 정보를 지도로 확인할 수 있습니다. 지역별 분포를 시각화하여 관리에 도움이 됩니다.
    </p>
    
    <div class="map-controls">
      <button @click="reloadMap" class="reload-button" :disabled="loading">
        {{ loading ? '로딩 중...' : '데이터 새로고침' }}
      </button>
    </div>
    
    <div class="map-stats">
      <div class="stat-item">
        <span class="stat-label">전체 사용자:</span>
        <span class="stat-value">{{ userLocations.length }}명</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">위치 표시 가능:</span>
        <span class="stat-value">{{ geocodedLocations.length }}명</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">위치 표시 불가능:</span>
        <span class="stat-value">{{ unmappableLocations.length }}명</span>
      </div>
    </div>
    
    <div id="map" ref="mapRef" class="naver-map"></div>
    
    <div v-if="unmappableLocations.length > 0" class="unmappable-users">
      <h3>위치 표시 불가능 사용자 리스트</h3>
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>성별</th>
              <th>나이</th>
              <th>위치정보</th>
              <th>교회명</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in unmappableLocations" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.gender }}</td>
              <td>{{ user.birth_year ? (new Date().getFullYear() - user.birth_year) : "-" }}</td>
              <td>{{ user.location }}</td>
              <td>{{ user.church_name || "-" }}</td>
              <td>{{ formatDateWithDaysPassed(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 전체 사용자 리스트 -->
    <div class="all-users-section">
      <h3>전체 사용자 리스트</h3>
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>성별</th>
              <th>나이</th>
              <th>위치정보</th>
              <th>교회명</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userLocations" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.name }}</td>
              <td>{{ user.gender }}</td>
              <td>{{ user.birth_year ? (new Date().getFullYear() - user.birth_year) : "-" }}</td>
              <td>{{ user.location }}</td>
              <td>{{ user.church_name || "-" }}</td>
              <td>{{ formatDateWithDaysPassed(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import supabase from '../../supabase';

export default {
  name: 'UserLocationMap',
  setup() {
    const mapRef = ref(null);
    const map = ref(null);
    const markers = ref([]);
    const userLocations = ref([]);
    const geocodedLocations = ref([]);
    const unmappableLocations = ref([]);
    const loading = ref(false);
    const errorMessage = ref('');
    
    // 네이버 맵 스크립트 로딩
    const loadNaverMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.naver && window.naver.maps) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_CLIENT_ID}&submodules=geocoder`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (e) => reject(e);
        document.head.appendChild(script);
      });
    };
    
    // 사용자 위치 데이터 가져오기
    const fetchUserLocations = async () => {
      try {
        loading.value = true;
        errorMessage.value = '';
        
        const { data, error } = await supabase
          .from('dating')
          .select('id, name, location, church_name, gender, birth_year, created_at')
          .not('location', 'is', null);
        
        if (error) {
          throw new Error(error.message);
        }
        
        userLocations.value = data.filter(user => user.location && user.location.trim() !== '');
        await geocodeAndAddMarkers();
      } catch (err) {
        console.error('사용자 위치 정보를 가져오는 데 실패했습니다:', err);
        errorMessage.value = '사용자 위치 정보를 가져오는 데 실패했습니다.';
      } finally {
        loading.value = false;
      }
    };
    
    // 주소를 지오코딩하여 좌표로 변환
    const geocodeAddress = (address) => {
      return new Promise((resolve) => {
        if (!window.naver || !window.naver.maps) {
          resolve(null);
          return;
        }
        
        window.naver.maps.Service.geocode(
          { query: address },
          (status, response) => {
            if (status === window.naver.maps.Service.Status.OK) {
              const result = response.v2.addresses[0];
              if (result) {
                resolve({
                  lat: parseFloat(result.y),
                  lng: parseFloat(result.x),
                });
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        );
      });
    };
    
    // 사용자 위치 지오코딩 및 마커 추가
    const geocodeAndAddMarkers = async () => {
      if (!map.value || !window.naver) return;
      
      // 기존 마커 제거
      markers.value.forEach(marker => {
        marker.setMap(null);
      });
      markers.value = [];
      geocodedLocations.value = [];
      unmappableLocations.value = [];
      
      const bounds = new window.naver.maps.LatLngBounds();
      let hasValidCoordinates = false;
      
      for (const user of userLocations.value) {
        try {
          const coordinates = await geocodeAddress(user.location);
          if (coordinates) {
            hasValidCoordinates = true;
            const markerPosition = new window.naver.maps.LatLng(coordinates.lat, coordinates.lng);
            
            // 마커 추가
            const marker = new window.naver.maps.Marker({
              position: markerPosition,
              map: map.value,
              title: user.name,
              icon: {
                content: `
                  <div class="custom-marker ${user.gender === '남자' ? 'male' : 'female'}">
                    <span class="marker-text">${user.name.charAt(0)}</span>
                  </div>
                `,
                anchor: new window.naver.maps.Point(15, 15)
              }
            });
            
            // 가입일 포맷팅 및 경과일수 계산
            const formatDateWithDaysPassed = (dateString) => {
              if (!dateString) return '정보 없음';
              
              const date = new Date(dateString);
              const formattedDate = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
              
              // 경과일수 계산
              const today = new Date();
              const diffTime = Math.abs(today - date);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              return `${formattedDate} (가입 후 ${diffDays}일)`;
            };
            
            // DOM 요소 직접 생성 (문자열 대신 DOM 요소 사용)
            const contentContainer = document.createElement('div');
            contentContainer.className = 'info-window';
            
            // 헤더 생성
            const headerDiv = document.createElement('div');
            headerDiv.className = 'info-header';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'info-title';
            titleDiv.textContent = user.name;
            
            const closeBtn = document.createElement('div');
            closeBtn.className = 'info-close-btn';
            closeBtn.textContent = '✕';
            
            headerDiv.appendChild(titleDiv);
            headerDiv.appendChild(closeBtn);
            
            // 컨텐츠 생성
            const contentDiv = document.createElement('div');
            contentDiv.className = 'info-content';
            
            const genderP = document.createElement('p');
            genderP.innerHTML = `성별: ${user.gender}`;
            
            const locationP = document.createElement('p');
            locationP.innerHTML = `지역: ${user.location}`;
            
            const birthYearP = document.createElement('p');
            birthYearP.innerHTML = `출생년도: ${user.birth_year || '정보 없음'}`;
            
            const createdAtP = document.createElement('p');
            createdAtP.innerHTML = `가입일: ${formatDateWithDaysPassed(user.created_at)}`;
            
            contentDiv.appendChild(genderP);
            contentDiv.appendChild(locationP);
            contentDiv.appendChild(birthYearP);
            contentDiv.appendChild(createdAtP);
            
            // 액션 버튼 생성
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'info-actions';
            
            const profileBtn = document.createElement('button');
            profileBtn.className = 'profile-button';
            profileBtn.textContent = '프로필 보기';
            profileBtn.addEventListener('click', function(e) {
              e.preventDefault();
              window.open(`/profile/${user.id}`, '_blank');
            });
            
            actionsDiv.appendChild(profileBtn);
            
            // 전체 컨테이너에 요소들 추가
            contentContainer.appendChild(headerDiv);
            contentContainer.appendChild(contentDiv);
            contentContainer.appendChild(actionsDiv);
            
            // 정보창 생성
            const infoWindow = new window.naver.maps.InfoWindow({
              content: contentContainer,
              backgroundColor: '#fff',
              borderWidth: 1,
              borderColor: '#ddd',
              disableAnchor: true,
              pixelOffset: new window.naver.maps.Point(0, -10)
            });
            
            // 닫기 버튼 이벤트 추가
            closeBtn.addEventListener('click', () => {
              infoWindow.close();
            });
            
            // 마커 클릭 이벤트
            window.naver.maps.Event.addListener(marker, 'click', () => {
              if (infoWindow.getMap()) {
                infoWindow.close();
              } else {
                infoWindow.open(map.value, marker);
              }
            });
            
            markers.value.push(marker);
            geocodedLocations.value.push({
              ...user,
              coordinates
            });
            bounds.extend(markerPosition);
          }
        } catch (err) {
          console.error(`'${user.location}' 주소를 지오코딩하는데 실패했습니다:`, err);
        }
      }
      
      // 지도 영역 조정
      if (hasValidCoordinates) {
        map.value.fitBounds(bounds);
      }
      
      // 지오코딩에 실패한 사용자 추출
      unmappableLocations.value = userLocations.value.filter(user => {
        return !geocodedLocations.value.some(geocodedUser => geocodedUser.id === user.id);
      });
    };
    
    // 맵 초기화
    const initMap = async () => {
      try {
        if (!mapRef.value) return;
        
        await loadNaverMapsScript();
        
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 중심
          zoom: 7,
          mapTypeControl: true,
          zoomControl: true,
          zoomControlOptions: {
            style: window.naver.maps.ZoomControlStyle.SMALL,
            position: window.naver.maps.Position.TOP_RIGHT
          }
        };
        
        map.value = new window.naver.maps.Map(mapRef.value, mapOptions);
        await fetchUserLocations();
      } catch (err) {
        console.error('지도를 초기화하는데 실패했습니다:', err);
        errorMessage.value = '지도를 초기화하는데 실패했습니다. 페이지를 새로고침해주세요.';
      }
    };
    
    // 지도 새로고침
    const reloadMap = () => {
      fetchUserLocations();
    };
    
    onMounted(() => {
      initMap();
    });
    
    // 가입일 포맷팅 및 경과일수 계산
    const formatDateWithDaysPassed = (dateString) => {
      if (!dateString) return '-';
      
      const createdAt = new Date(dateString);
      const now = new Date();
      
      // 경과일 계산
      const diffTime = Math.abs(now - createdAt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const year = createdAt.getFullYear();
      const month = createdAt.getMonth() + 1;
      const day = createdAt.getDate();
      
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} (${diffDays}일 전)`;
    };
    
    return {
      mapRef,
      loading,
      errorMessage,
      userLocations,
      geocodedLocations,
      unmappableLocations,
      reloadMap,
      formatDateWithDaysPassed
    };
  }
};
</script>

<style scoped>
.user-location-map {
  padding: 1rem;
}

.map-description {
  margin-bottom: 1rem;
  color: #666;
}

.naver-map {
  width: 100%;
  height: 600px;
  margin: 1rem 0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.map-controls {
  display: flex;
  justify-content: flex-end;
}

.unmappable-users, .all-users-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.unmappable-users h3, .all-users-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
  display: inline-block;
}

.all-users-section {
  background-color: #f8f9fa;
}

.map-controls {
  margin-bottom: 1rem;
}

.reload-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-weight: bold;
}

.reload-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.map-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-label {
  font-weight: bold;
  margin-right: 0.5rem;
  color: #555;
}

.stat-value {
  color: #2c3e50;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}

/* 커스텀 마커 스타일 */
:global(.custom-marker) {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

:global(.male) {
  background-color: #3498db;
}

:global(.female) {
  background-color: #e74c3c;
}

:global(.marker-text) {
  font-size: 14px;
}

:global(.info-window) {
  padding: 10px;
  min-width: 200px;
}

:global(.info-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}

:global(.info-title) {
  font-weight: bold;
}

:global(.info-close-btn) {
  cursor: pointer;
  font-size: 14px;
  color: #777;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

:global(.info-close-btn:hover) {
  background-color: #f0f0f0;
  color: #333;
}

:global(.info-content p) {
  margin: 5px 0;
  font-size: 13px;
}

:global(.info-actions) {
  margin-top: 10px;
  text-align: center;
}

:global(.profile-button) {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

:global(.profile-button:hover) {
  background-color: #2980b9;
}

.unmappable-users {
  margin-top: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.unmappable-users h3 {
  margin-top: 0;
  color: #e74c3c;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.users-table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.users-table th {
  background-color: #f2f2f2;
  position: sticky;
  top: 0;
  z-index: 1;
}

.users-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.users-table tr:hover {
  background-color: #f1f1f1;
}

@media (max-width: 768px) {
  .naver-map {
    height: 400px;
  }
  
  .users-table {
    font-size: 12px;
  }
  
  .users-table th,
  .users-table td {
    padding: 6px 8px;
  }
}
</style>
