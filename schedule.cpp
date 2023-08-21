#include <fstream>
#include <iostream>
#include <string>
#include <array>

int main() {
  int request;
  const std::array<std::string, 7> days = {"Monday", "Tuesday",  "Wednesday", "Thursday",
                               "Friday", "Saturday", "Sunday"};
  std::ifstream input;
  std::ofstream output;

  output.open("request.txt");

  for (int i = 0; i <= 6; i++) {
    std::cout << "What is your request for " + days[i] + "?";
    std::cout << "\n1. anything\n2. reg only\n3. relief only\n4. as only\n5. off\n" << std::endl;
    std::cout << "--> ";
    std::cin >> request;

    std::cout << std::endl;

    output << request << std::endl;
  }

  output.close();

  input.open("request.txt");

  while (input) {
  }

  return 0;
}
