from setuptools import find_packages,setup
from typing import List

HYPEN_E_DOT='-e .'

#  read all packages from requirement.txt file
def get_requirements(file_path:str)->List[str]:
    requirements=[]
    with open(file_path) as f:
        requirements=f.readlines()
        requirements=[req.replace("\n","") for req in requirements]
        
        if HYPEN_E_DOT in requirements:
            requirements.remove(HYPEN_E_DOT)

        return requirements

# setup
setup(
    name='MediCook.AI',
    version='0.1',
    install_requires=get_requirements('requirements.txt'),
    packages=find_packages()
)