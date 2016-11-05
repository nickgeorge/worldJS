#!/usr/bin/env python

import sys
import argparse

parser = argparse.ArgumentParser(
    description='Tool for converting .obj files into format consumable by worldJS.')
parser.add_argument('input_file', type=argparse.FileType('r'))
parser.add_argument('-o', '--output_file',
    dest='output_file', type=argparse.FileType('w'))
parser.add_argument('-n', '--name',
    dest='name')

args = parser.parse_args()
input_file = args.input_file
output_file = args.output_file
name = args.name

coordinateLines = []
textureLines = []
normalLines = []
faces = []

for line in input_file:
  tokens = line.strip().split(' ');
  if tokens[0] == 'v':
    coordinateLines.append(map(float, tokens[1:]))
  if tokens[0] == 'vt':
    textureLines.append(map(float, tokens[1:]))
  if tokens[0] == 'vn':
    normalLines.append(map(float, tokens[1:]))
  if tokens[0] == 'f':
    faces.append(tokens[1:]);
input_file.close()

coordinates = []
textureCoordinates = []
normals = []

def addVertex(vertex):
  indices = vertex.split('/')

  coordinateIndex = int(indices[0]) - 1
  coordinates.extend(coordinateLines[coordinateIndex])

  # some models don't have a middle texture index
  if (indices[1]):
    textureIndex = int(indices[1]) - 1
    textureCoordinates.extend(textureLines[textureIndex])
  else:
    textureCoordinates.extend([0, 0, 0])

  normalIndex = int(indices[2]) - 1
  normals.extend(normalLines[normalIndex])

for face in faces:
  if len(face) == 3:
    addVertex(face[0]);
    addVertex(face[1]);
    addVertex(face[2]);
  elif len(face) == 4:
    addVertex(face[0]);
    addVertex(face[1]);
    addVertex(face[2]);
    addVertex(face[2]);
    addVertex(face[3]);
    addVertex(face[0]);

output_file = args.output_file

output_file.write('goog.provide(\'%s\');' % name);
output_file.write('\n');
output_file.write('%s = {\n' % name)
output_file.write('  type: \'%s\',\n' % name)
output_file.write('  vertexCoordinates: %s,\n' % coordinates)
output_file.write('  textureCoordinates: %s,\n' % textureCoordinates)
output_file.write('  normalCoordinates: %s,\n' % normals)
output_file.write('}')
output_file.close()

