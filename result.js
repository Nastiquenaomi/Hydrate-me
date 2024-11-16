document.addEventListener('DOMContentLoaded', () => {
  const waterGoal = sessionStorage.getItem('waterGoal');
  document.getElementById('waterGoalMessage').innerText = `Your recommended water intake is ${waterGoal} ml per day.`;
});
