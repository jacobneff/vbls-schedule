#include <fstream>
#include <iostream>
#include <string>
#include <array>

int main() {
  std::string request;
  const std::array<std::string, 7> days = {"Monday", "Tuesday",  "Wednesday", "Thursday",
                               "Friday", "Saturday", "Sunday"};

  std::ofstream output;
  output.open("request.txt");

  for (int i = 0; i <= 6; i++) {
    std::cout << "What is your request for " + days[i] + ": ";
    std::cin >> request;

    output << request << std::endl;
  }

  output.close();

  /* while (output) { */
  /* } */

  return 0;
}
