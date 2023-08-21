#include <fstream>
#include <iostream>

int main() {
  std::string request;
  const std::array<string, 7> days = {"Monday", "Tuesday",  "Wednesday", "Thursday",
                               "Friday", "Saturday", "Sunday"};

  std::ifstream input;
  input.open("request.txt");

  for (int i = 0; i <= 6; i++) {
    std::cout << "What is your request for " + days[i] + ": ";
    std::cin >> request;

    input >> request;
  }

  while (input) {
  }
  
  return 0;
}
