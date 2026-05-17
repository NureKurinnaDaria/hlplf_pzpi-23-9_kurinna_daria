class Book:
    def __init__(self, name, author, year):
        self.name = name
        self.author = author
        self.year = year

    def print_info(self):
        print("Книга:", self.name)
        print("Автор:", self.author)
        print("Рік видання:", self.year)
        
b = Book("Кобзар", "Шевченко", 1840)
b.print_info()