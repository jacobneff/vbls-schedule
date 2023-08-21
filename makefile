schedule: schedule.cpp request.txt
	: > request.txt
	g++ -o schedule schedule.cpp -std=c++20 -lstdc++
