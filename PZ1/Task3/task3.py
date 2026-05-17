from datetime import datetime

birth_year = int(input("Рік народження: "))
current_year = datetime.now().year

if birth_year <= current_year:
    print("Ваш вік:", current_year - birth_year)
else:
    print("Неправильно введено рік")