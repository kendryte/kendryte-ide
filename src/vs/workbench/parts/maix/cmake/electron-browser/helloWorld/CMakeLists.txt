# Main CMakeFile
cmake_minimum_required(VERSION 3.0.0)

include("${SDK}/cmake/common.cmake")

project(test_app)
add_source_files(*.c *.h *.cpp *.hpp *.C *.H *.CPP *.HPP)

include("${SDK}/cmake/executable.cmake")
