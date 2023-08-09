#include <fstream>
#include <iostream>

using namespace std;

int main() {
  string request;

  ofstream input;
  input.open("request.txt");

  cout << "What is your schedule request? ";
  cin >> request;
}
