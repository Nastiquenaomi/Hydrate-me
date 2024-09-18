import time
import winsound

mlPerKg = 238  # Milliliters of water to be taken in a day per kg of persons body weight
def remindToDrinkWater(interval, waterGoal):
    water_consumed = 0
    while True:
        print("Time to drink water!")
        winsound.Beep(1000, 1000)  # an alarm sound will play here, a beep sound 

        water_consumed += float(input("Enter the amount of water you drank (in milliliters): "))
        print(f"Total water consumed: {water_consumed}ml")
        
        remainingWater = waterGoal - water_consumed
        if remainingWater > 0:
            print(f"Keep going! You have {remainingWater}ml more to drink to reach your goal of {waterGoal}ml.")
        else:
            print("Congratulations! You've met your water intake goal for the day!")
        
        time.sleep(interval * 60)  # Sleep for the specified interval in minutes

def main():
    print("Welcome to the Water Reminder Program!")
    weight = float(input("Enter your weight in kilograms: "))
    interval = float(input("Enter the time interval between reminders (in minutes): "))
    
    waterGoal = weight * mlPerKg
    print(f"Your recommended daily water intake is {waterGoal}ml.")
    print(f"You will be reminded to drink water every {interval} minutes.")
    
    try:
        remindToDrinkWater(interval, waterGoal)
    except KeyboardInterrupt:
        print("\nProgram stopped by user.")

if __name__ == "__main__":
    main()
