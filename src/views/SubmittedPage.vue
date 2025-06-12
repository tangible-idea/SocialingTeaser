<template>
  <div class="submitted-page">
    <p>입력하신 양식이 잘 입력되었습니다.</p>
    <p>프로필 확인 후에 가입이 완료되면, 알림톡으로 전송드리겠습니다!</p>
  </div>
</template>

<script setup>
// No script needed for this simple page
</script>

<style scoped>
.submitted-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  min-height: 50vh; /* Adjust as needed */
}

.submitted-page p {
  margin-bottom: 10px;
  font-size: 1.2em; /* Adjust as needed */
}
</style>
